<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { ordersApi } from '@/api/orders';
import { customersApi } from '@/api/customers';
import { settingsApi } from '@/api/settings';
import { usersApi } from '@/api/users';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const orderId = computed(() => route.params.id);
const isEdit = computed(() => !!orderId.value);

const customers = ref([]);
const statuses = ref([]);
const users = ref([]);
const milestoneTemplates = ref([]);

const order = ref({
    customer: route.query.customer || null,
    status: null,
    name: '',
    description: '',
    order_date: new Date(),
    deadline: null,
    discount_percent: 0,
    discount_amount: 0,
    internal_notes: '',
    assigned_to: null,
    items: [],
    milestones: []
});

const loadOrder = async () => {
    if (!orderId.value) return;
    loading.value = true;
    try {
        const data = await ordersApi.get(orderId.value);
        order.value = {
            ...data,
            order_date: data.order_date ? new Date(data.order_date) : new Date(),
            deadline: data.deadline ? new Date(data.deadline) : null
        };
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
        router.push('/orders');
    } finally {
        loading.value = false;
    }
};

const loadFormData = async () => {
    try {
        const [customersData, statusesData, usersData, templatesData] = await Promise.all([
            customersApi.dropdown(),
            settingsApi.statuses.list({ is_active: true }),
            usersApi.dropdown(),
            settingsApi.milestoneTemplates.list({ is_active: true })
        ]);
        customers.value = customersData || [];
        statuses.value = statusesData.results || [];
        users.value = usersData || [];
        milestoneTemplates.value = templatesData.results || [];

        // Set default status
        if (!isEdit.value && statuses.value.length) {
            const defaultStatus = statuses.value.find(s => s.is_default);
            order.value.status = defaultStatus?.id || statuses.value[0].id;
        }
    } catch (error) {
        console.error('Failed to load form data:', error);
    }
};

const addItem = () => {
    order.value.items.push({
        name: '',
        description: '',
        quantity: 1,
        unit: 'db',
        unit_price: 0,
        discount_percent: 0,
        sort_order: order.value.items.length
    });
};

const removeItem = (index) => {
    order.value.items.splice(index, 1);
};

const addMilestone = () => {
    order.value.milestones.push({
        name: '',
        description: '',
        due_date: null,
        color: '#3B82F6',
        sort_order: order.value.milestones.length
    });
};

const removeMilestone = (index) => {
    order.value.milestones.splice(index, 1);
};

const applyMilestoneTemplate = (template) => {
    const baseDate = order.value.deadline || order.value.order_date || new Date();
    const dueDate = new Date(baseDate);
    
    if (template.offset_from === 'order_date') {
        dueDate.setDate(new Date(order.value.order_date).getDate() + template.days_offset);
    } else {
        dueDate.setDate(dueDate.getDate() + template.days_offset);
    }

    order.value.milestones.push({
        name: template.name,
        description: template.description,
        due_date: dueDate,
        color: template.color,
        sort_order: order.value.milestones.length
    });
};

const calculateSubtotal = computed(() => {
    return order.value.items.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
        const discount = itemTotal * ((item.discount_percent || 0) / 100);
        return sum + itemTotal - discount;
    }, 0);
});

const calculateTotal = computed(() => {
    let total = calculateSubtotal.value;
    if (order.value.discount_percent) {
        total -= total * (order.value.discount_percent / 100);
    }
    if (order.value.discount_amount) {
        total -= order.value.discount_amount;
    }
    return Math.max(0, total);
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency', currency: 'HUF', minimumFractionDigits: 0
    }).format(value || 0);
};

const saveOrder = async () => {
    saving.value = true;
    try {
        const payload = {
            ...order.value,
            order_date: order.value.order_date?.toISOString().split('T')[0],
            deadline: order.value.deadline?.toISOString().split('T')[0] || null,
            milestones: order.value.milestones.map(m => ({
                ...m,
                due_date: m.due_date?.toISOString?.().split('T')[0] || m.due_date
            }))
        };

        if (isEdit.value) {
            await ordersApi.update(orderId.value, payload);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Megrendelés frissítve', life: 3000 });
        } else {
            const result = await ordersApi.create(payload);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Megrendelés létrehozva', life: 3000 });
            router.push(`/orders/${result.id}`);
            return;
        }
        router.push(`/orders/${orderId.value}`);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Mentési hiba', life: 3000 });
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    loadFormData();
    if (isEdit.value) loadOrder();
});
</script>

<template>
    <div class="card">
        <Toast />
        
        <!-- Header -->
        <div class="flex align-items-center justify-content-between mb-5">
            <div class="flex align-items-center gap-3">
                <Button icon="pi pi-arrow-left" rounded text @click="router.back()" />
                <div>
                    <h2 class="m-0 text-2xl font-semibold">
                        {{ isEdit ? 'Megrendelés szerkesztése' : 'Új megrendelés' }}
                    </h2>
                    <p v-if="isEdit && order.reference_number" class="mt-1 mb-0 text-color-secondary">
                        {{ order.reference_number }}
                    </p>
                </div>
            </div>
            <div class="flex gap-2">
                <Button label="Mégse" severity="secondary" outlined @click="router.back()" />
                <Button label="Mentés" icon="pi pi-check" :loading="saving" @click="saveOrder" />
            </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-8">
            <ProgressSpinner />
        </div>

        <div v-else class="grid">
            <!-- Main Form -->
            <div class="col-12 lg:col-8">
                <TabView>
                    <TabPanel header="Alapadatok">
                        <div class="grid">
                            <div class="col-12 md:col-6">
                                <label class="block text-900 font-medium mb-2">Ügyfél *</label>
                                <Select 
                                    v-model="order.customer" 
                                    :options="customers"
                                    optionLabel="display_name"
                                    optionValue="id"
                                    placeholder="Válasszon ügyfelet"
                                    class="w-full"
                                    filter
                                    showClear
                                />
                            </div>
                            <div class="col-12 md:col-6">
                                <label class="block text-900 font-medium mb-2">Státusz *</label>
                                <Select 
                                    v-model="order.status" 
                                    :options="statuses"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Válasszon státuszt"
                                    class="w-full"
                                >
                                    <template #option="{ option }">
                                        <div class="flex align-items-center gap-2">
                                            <span class="w-1rem h-1rem border-round" :style="{ backgroundColor: option.color }"></span>
                                            {{ option.name }}
                                        </div>
                                    </template>
                                </Select>
                            </div>
                            <div class="col-12">
                                <label class="block text-900 font-medium mb-2">Megrendelés neve *</label>
                                <InputText v-model="order.name" class="w-full" />
                            </div>
                            <div class="col-12">
                                <label class="block text-900 font-medium mb-2">Leírás</label>
                                <Textarea v-model="order.description" class="w-full" rows="3" />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block text-900 font-medium mb-2">Megrendelés dátuma *</label>
                                <DatePicker v-model="order.order_date" dateFormat="yy.mm.dd" class="w-full" showIcon />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block text-900 font-medium mb-2">Határidő</label>
                                <DatePicker v-model="order.deadline" dateFormat="yy.mm.dd" class="w-full" showIcon />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block text-900 font-medium mb-2">Felelős</label>
                                <Select 
                                    v-model="order.assigned_to" 
                                    :options="users"
                                    optionLabel="full_name"
                                    optionValue="id"
                                    placeholder="Válasszon"
                                    class="w-full"
                                    showClear
                                />
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Items Tab -->
                    <TabPanel header="Tételek">
                        <div class="flex justify-content-between align-items-center mb-4">
                            <h5 class="m-0">Tételek</h5>
                            <Button label="Új tétel" icon="pi pi-plus" size="small" @click="addItem" />
                        </div>

                        <div v-if="order.items.length === 0" class="text-center py-5 text-color-secondary">
                            <i class="pi pi-box text-4xl mb-3"></i>
                            <p class="m-0">Még nincs tétel hozzáadva</p>
                        </div>

                        <div v-for="(item, index) in order.items" :key="index" class="surface-100 border-round p-4 mb-3">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Tétel neve *</label>
                                    <InputText v-model="item.name" class="w-full" />
                                </div>
                                <div class="col-6 md:col-2">
                                    <label class="block text-900 font-medium mb-2">Mennyiség</label>
                                    <InputNumber v-model="item.quantity" class="w-full" :min="0" />
                                </div>
                                <div class="col-6 md:col-2">
                                    <label class="block text-900 font-medium mb-2">Egység</label>
                                    <InputText v-model="item.unit" class="w-full" />
                                </div>
                                <div class="col-6 md:col-2">
                                    <label class="block text-900 font-medium mb-2">Egységár</label>
                                    <InputNumber v-model="item.unit_price" class="w-full" :min="0" suffix=" Ft" />
                                </div>
                                <div class="col-12">
                                    <label class="block text-900 font-medium mb-2">Leírás</label>
                                    <Textarea v-model="item.description" class="w-full" rows="2" />
                                </div>
                                <div class="col-12 flex justify-content-end">
                                    <Button icon="pi pi-trash" label="Törlés" severity="danger" text size="small" @click="removeItem(index)" />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Milestones Tab -->
                    <TabPanel header="Mérföldkövek">
                        <div class="flex justify-content-between align-items-center mb-4">
                            <h5 class="m-0">Mérföldkövek</h5>
                            <div class="flex gap-2">
                                <SplitButton 
                                    v-if="milestoneTemplates.length"
                                    label="Sablon"
                                    icon="pi pi-file"
                                    :model="milestoneTemplates.map(t => ({ label: t.name, command: () => applyMilestoneTemplate(t) }))"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                />
                                <Button label="Új mérföldkő" icon="pi pi-plus" size="small" @click="addMilestone" />
                            </div>
                        </div>

                        <div v-if="order.milestones.length === 0" class="text-center py-5 text-color-secondary">
                            <i class="pi pi-flag text-4xl mb-3"></i>
                            <p class="m-0">Még nincs mérföldkő hozzáadva</p>
                        </div>

                        <div v-for="(milestone, index) in order.milestones" :key="index" class="surface-100 border-round p-4 mb-3">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <label class="block text-900 font-medium mb-2">Mérföldkő neve *</label>
                                    <InputText v-model="milestone.name" class="w-full" />
                                </div>
                                <div class="col-12 md:col-4">
                                    <label class="block text-900 font-medium mb-2">Határidő *</label>
                                    <DatePicker v-model="milestone.due_date" dateFormat="yy.mm.dd" class="w-full" showIcon />
                                </div>
                                <div class="col-12 md:col-2">
                                    <label class="block text-900 font-medium mb-2">Szín</label>
                                    <ColorPicker v-model="milestone.color" class="w-full" />
                                </div>
                                <div class="col-12 flex justify-content-end">
                                    <Button icon="pi pi-trash" label="Törlés" severity="danger" text size="small" @click="removeMilestone(index)" />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>

            <!-- Sidebar -->
            <div class="col-12 lg:col-4">
                <!-- Summary -->
                <div class="card sticky" style="top: 1rem">
                    <h5 class="mb-4">Összesítő</h5>
                    <div class="flex flex-column gap-3 mb-4">
                        <div class="flex justify-content-between">
                            <span class="text-color-secondary">Részösszeg</span>
                            <span class="font-medium">{{ formatCurrency(calculateSubtotal) }}</span>
                        </div>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-color-secondary">Kedvezmény (%)</span>
                            <InputNumber v-model="order.discount_percent" :min="0" :max="100" suffix="%" class="w-6rem" />
                        </div>
                        <div class="flex justify-content-between align-items-center">
                            <span class="text-color-secondary">Kedvezmény (Ft)</span>
                            <InputNumber v-model="order.discount_amount" :min="0" suffix=" Ft" class="w-8rem" />
                        </div>
                        <Divider />
                        <div class="flex justify-content-between">
                            <span class="text-xl font-semibold">Összesen</span>
                            <span class="text-xl font-bold text-primary">{{ formatCurrency(calculateTotal) }}</span>
                        </div>
                    </div>

                    <!-- Internal Notes -->
                    <h5 class="mb-3">Belső megjegyzés</h5>
                    <Textarea 
                        v-model="order.internal_notes" 
                        class="w-full" 
                        rows="4" 
                        placeholder="Csak a csapat látja..."
                    />
                </div>
            </div>
        </div>
    </div>
</template>
