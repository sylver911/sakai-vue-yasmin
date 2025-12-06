<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { ordersApi } from '@/api/orders';
import { settingsApi } from '@/api/settings';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const order = ref(null);
const statuses = ref([]);
const newComment = ref('');
const addingComment = ref(false);

const orderId = computed(() => route.params.id);

const loadOrder = async () => {
    loading.value = true;
    try {
        const [orderData, statusesData] = await Promise.all([
            ordersApi.get(orderId.value),
            settingsApi.statuses.list({ is_active: true })
        ]);
        order.value = orderData;
        statuses.value = statusesData.results || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
        router.push('/orders');
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('hu-HU', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency', currency: 'HUF', minimumFractionDigits: 0
    }).format(value || 0);
};

const updateStatus = async (statusId) => {
    try {
        await ordersApi.update(orderId.value, { status: statusId });
        order.value.status = statusId;
        const status = statuses.value.find(s => s.id === statusId);
        order.value.status_name = status?.name;
        order.value.status_color = status?.color;
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Státusz frissítve', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült frissíteni', life: 3000 });
    }
};

const addComment = async () => {
    if (!newComment.value.trim()) return;
    addingComment.value = true;
    try {
        const comment = await ordersApi.comments.create(orderId.value, { content: newComment.value });
        order.value.comments = order.value.comments || [];
        order.value.comments.unshift(comment);
        newComment.value = '';
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Megjegyzés hozzáadva', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült hozzáadni', life: 3000 });
    } finally {
        addingComment.value = false;
    }
};

const toggleMilestone = async (milestone) => {
    try {
        if (milestone.completed_at) {
            await ordersApi.milestones.uncomplete(orderId.value, milestone.id);
            milestone.completed_at = null;
        } else {
            await ordersApi.milestones.complete(orderId.value, milestone.id);
            milestone.completed_at = new Date().toISOString();
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült frissíteni', life: 3000 });
    }
};

const confirmDelete = () => {
    confirm.require({
        message: `Biztosan törölni szeretné a "${order.value.reference_number}" megrendelést?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await ordersApi.delete(orderId.value);
                toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Megrendelés törölve', life: 3000 });
                router.push('/orders');
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    loadOrder();
});
</script>

<template>
    <div>
        <Toast />
        <ConfirmDialog />

        <div v-if="loading" class="card flex justify-content-center py-8">
            <ProgressSpinner />
        </div>

        <template v-else-if="order">
            <!-- Header Card -->
            <div class="card mb-4">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4">
                    <div>
                        <div class="flex align-items-center gap-3 mb-2">
                            <h2 class="m-0 text-2xl font-semibold">{{ order.reference_number }}</h2>
                            <Tag 
                                :value="order.status_name"
                                :style="{ backgroundColor: order.status_color, color: '#fff' }"
                            />
                            <Tag v-if="order.is_overdue" value="Késedelmes" severity="danger" />
                        </div>
                        <h3 class="m-0 text-lg font-medium text-color-secondary">{{ order.name }}</h3>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <Select 
                            :modelValue="order.status"
                            :options="statuses"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Státusz váltás"
                            class="w-12rem"
                            @update:modelValue="updateStatus"
                        >
                            <template #option="{ option }">
                                <div class="flex align-items-center gap-2">
                                    <span class="w-1rem h-1rem border-round" :style="{ backgroundColor: option.color }"></span>
                                    {{ option.name }}
                                </div>
                            </template>
                        </Select>
                        <Button icon="pi pi-pencil" label="Szerkesztés" @click="router.push(`/orders/${orderId}/edit`)" />
                        <Button icon="pi pi-trash" severity="danger" outlined @click="confirmDelete" />
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="grid">
                <!-- Main Content -->
                <div class="col-12 lg:col-8">
                    <TabView>
                        <!-- Details Tab -->
                        <TabPanel header="Részletek">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <h5 class="mb-3">Alapadatok</h5>
                                    <div class="flex flex-column gap-3">
                                        <div>
                                            <span class="text-color-secondary text-sm">Ügyfél</span>
                                            <div class="font-medium">
                                                <router-link :to="`/customers/${order.customer}`" class="text-primary">
                                                    {{ order.customer_name }}
                                                </router-link>
                                            </div>
                                        </div>
                                        <div>
                                            <span class="text-color-secondary text-sm">Megrendelés dátuma</span>
                                            <div class="font-medium">{{ formatDate(order.order_date) }}</div>
                                        </div>
                                        <div>
                                            <span class="text-color-secondary text-sm">Határidő</span>
                                            <div class="font-medium" :class="{ 'text-red-500': order.is_overdue }">
                                                {{ formatDate(order.deadline) }}
                                            </div>
                                        </div>
                                        <div v-if="order.assigned_to_name">
                                            <span class="text-color-secondary text-sm">Felelős</span>
                                            <div class="font-medium">{{ order.assigned_to_name }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <h5 class="mb-3">Pénzügyi adatok</h5>
                                    <div class="flex flex-column gap-3">
                                        <div class="flex justify-content-between">
                                            <span class="text-color-secondary">Részösszeg</span>
                                            <span class="font-medium">{{ formatCurrency(order.subtotal) }}</span>
                                        </div>
                                        <div v-if="order.discount_percent || order.discount_amount" class="flex justify-content-between">
                                            <span class="text-color-secondary">Kedvezmény</span>
                                            <span class="font-medium text-green-500">
                                                -{{ order.discount_percent ? `${order.discount_percent}%` : formatCurrency(order.discount_amount) }}
                                            </span>
                                        </div>
                                        <Divider class="my-2" />
                                        <div class="flex justify-content-between">
                                            <span class="text-xl font-semibold">Összesen</span>
                                            <span class="text-xl font-bold text-primary">{{ formatCurrency(order.total) }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="order.description" class="col-12">
                                    <h5 class="mb-3">Leírás</h5>
                                    <p class="m-0 text-color-secondary white-space-pre-wrap">{{ order.description }}</p>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Items Tab -->
                        <TabPanel header="Tételek">
                            <DataTable :value="order.items" responsiveLayout="scroll" class="p-datatable-sm">
                                <template #empty>
                                    <div class="text-center py-4 text-color-secondary">Nincs tétel</div>
                                </template>
                                <Column field="name" header="Megnevezés">
                                    <template #body="{ data }">
                                        <div class="font-medium">{{ data.name }}</div>
                                        <div v-if="data.description" class="text-sm text-color-secondary">{{ data.description }}</div>
                                    </template>
                                </Column>
                                <Column field="quantity" header="Mennyiség" style="width: 8rem">
                                    <template #body="{ data }">{{ data.quantity }} {{ data.unit }}</template>
                                </Column>
                                <Column field="unit_price" header="Egységár" style="width: 10rem">
                                    <template #body="{ data }">{{ formatCurrency(data.unit_price) }}</template>
                                </Column>
                                <Column header="Összeg" style="width: 10rem">
                                    <template #body="{ data }">
                                        <span class="font-medium">{{ formatCurrency(data.total) }}</span>
                                    </template>
                                </Column>
                            </DataTable>
                        </TabPanel>

                        <!-- Comments Tab -->
                        <TabPanel header="Megjegyzések">
                            <div class="mb-4">
                                <Textarea 
                                    v-model="newComment" 
                                    class="w-full mb-2" 
                                    rows="3" 
                                    placeholder="Új megjegyzés..."
                                />
                                <Button 
                                    label="Küldés" 
                                    icon="pi pi-send" 
                                    size="small"
                                    :loading="addingComment"
                                    :disabled="!newComment.trim()"
                                    @click="addComment"
                                />
                            </div>
                            <div v-if="!order.comments?.length" class="text-center py-4 text-color-secondary">
                                Még nincs megjegyzés
                            </div>
                            <div v-else class="flex flex-column gap-3">
                                <div v-for="comment in order.comments" :key="comment.id" class="surface-100 border-round p-3">
                                    <div class="flex align-items-center gap-2 mb-2">
                                        <Avatar :label="comment.created_by_name?.charAt(0)" shape="circle" size="small" />
                                        <span class="font-medium">{{ comment.created_by_name }}</span>
                                        <span class="text-color-secondary text-sm">{{ formatDate(comment.created_at) }}</span>
                                    </div>
                                    <p class="m-0 white-space-pre-wrap">{{ comment.content }}</p>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>

                <!-- Sidebar -->
                <div class="col-12 lg:col-4">
                    <!-- Milestones -->
                    <div class="card mb-4">
                        <h5 class="mb-3">Mérföldkövek</h5>
                        <div v-if="!order.milestones?.length" class="text-center py-4 text-color-secondary">
                            <i class="pi pi-flag text-3xl mb-2"></i>
                            <p class="m-0">Nincs mérföldkő</p>
                        </div>
                        <div v-else class="flex flex-column gap-2">
                            <div 
                                v-for="milestone in order.milestones" 
                                :key="milestone.id"
                                class="flex align-items-center gap-3 p-2 border-round cursor-pointer hover:surface-100"
                                :class="{ 'opacity-60': milestone.completed_at }"
                                @click="toggleMilestone(milestone)"
                            >
                                <Checkbox 
                                    :modelValue="!!milestone.completed_at" 
                                    :binary="true"
                                    @click.stop
                                    @update:modelValue="toggleMilestone(milestone)"
                                />
                                <div class="flex-1">
                                    <div class="font-medium" :class="{ 'line-through': milestone.completed_at }">
                                        {{ milestone.name }}
                                    </div>
                                    <div class="text-sm text-color-secondary">
                                        {{ formatDate(milestone.due_date) }}
                                    </div>
                                </div>
                                <span 
                                    class="w-0.5rem h-2rem border-round"
                                    :style="{ backgroundColor: milestone.color }"
                                ></span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Info -->
                    <div class="card">
                        <h5 class="mb-3">Információk</h5>
                        <div class="flex flex-column gap-3">
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Létrehozva</span>
                                <span class="font-medium">{{ formatDate(order.created_at) }}</span>
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Módosítva</span>
                                <span class="font-medium">{{ formatDate(order.updated_at) }}</span>
                            </div>
                            <div v-if="order.created_by_name" class="flex justify-content-between">
                                <span class="text-color-secondary">Létrehozta</span>
                                <span class="font-medium">{{ order.created_by_name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
