<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { customersApi } from '@/api/customers';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const customer = ref(null);
const customerOrders = ref([]);
const customerActivity = ref([]);

const customerId = computed(() => route.params.id);

const loadCustomer = async () => {
    loading.value = true;
    try {
        const [data, orders, activity] = await Promise.all([
            customersApi.get(customerId.value),
            customersApi.orders(customerId.value),
            customersApi.activity(customerId.value)
        ]);
        customer.value = data;
        customerOrders.value = orders || [];
        customerActivity.value = activity || [];
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Hiba',
            detail: 'Nem sikerült betölteni az ügyfél adatait',
            life: 3000
        });
        router.push('/customers');
    } finally {
        loading.value = false;
    }
};

const confirmDelete = () => {
    confirm.require({
        message: `Biztosan törölni szeretné "${customer.value.display_name}" ügyfelet?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await customersApi.delete(customerId.value);
                toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Ügyfél törölve', life: 3000 });
                router.push('/customers');
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni', life: 3000 });
            }
        }
    });
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('hu-HU');
};

onMounted(() => {
    loadCustomer();
});
</script>

<template>
    <div>
        <Toast />
        <ConfirmDialog />

        <div v-if="loading" class="card flex justify-content-center py-8">
            <ProgressSpinner />
        </div>

        <template v-else-if="customer">
            <!-- Header Card -->
            <div class="card mb-4">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4">
                    <div class="flex align-items-center gap-4">
                        <Avatar 
                            :label="customer.display_name?.charAt(0)" 
                            size="xlarge"
                            :style="{ backgroundColor: customer.customer_type === 'business' ? '#3B82F6' : '#22C55E' }"
                            class="text-white"
                            shape="circle"
                        />
                        <div>
                            <div class="flex align-items-center gap-2 mb-2">
                                <h2 class="m-0 text-2xl font-semibold">{{ customer.display_name }}</h2>
                                <Tag 
                                    :value="customer.is_active ? 'Aktív' : 'Inaktív'" 
                                    :severity="customer.is_active ? 'success' : 'danger'"
                                />
                            </div>
                            <div class="flex flex-wrap gap-3 text-color-secondary">
                                <span v-if="customer.identifier">
                                    <i class="pi pi-tag mr-1"></i>{{ customer.identifier }}
                                </span>
                                <span>
                                    <i class="pi pi-building mr-1"></i>{{ customer.customer_type_display }}
                                </span>
                                <span v-if="customer.primary_email">
                                    <i class="pi pi-envelope mr-1"></i>
                                    <a :href="`mailto:${customer.primary_email}`" class="text-primary">
                                        {{ customer.primary_email }}
                                    </a>
                                </span>
                                <span v-if="customer.primary_phone">
                                    <i class="pi pi-phone mr-1"></i>
                                    <a :href="`tel:${customer.primary_phone}`" class="text-primary">
                                        {{ customer.primary_phone }}
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <Button 
                            icon="pi pi-arrow-left" 
                            label="Vissza"
                            severity="secondary" 
                            outlined
                            @click="router.push('/customers')"
                        />
                        <Button 
                            icon="pi pi-pencil" 
                            label="Szerkesztés"
                            @click="router.push(`/customers/${customerId}/edit`)"
                        />
                        <Button 
                            icon="pi pi-trash" 
                            severity="danger"
                            outlined
                            @click="confirmDelete"
                        />
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="grid">
                <!-- Main Info -->
                <div class="col-12 lg:col-8">
                    <TabView>
                        <TabPanel header="Információk">
                            <div class="grid">
                                <!-- Basic Info -->
                                <div class="col-12 md:col-6">
                                    <h5 class="mb-3">Alapadatok</h5>
                                    <div class="flex flex-column gap-3">
                                        <div v-if="customer.customer_type === 'business'">
                                            <span class="text-color-secondary text-sm">Cégnév</span>
                                            <div class="font-medium">{{ customer.company_name }}</div>
                                        </div>
                                        <div v-else>
                                            <span class="text-color-secondary text-sm">Név</span>
                                            <div class="font-medium">{{ customer.last_name }} {{ customer.first_name }}</div>
                                        </div>
                                        <div v-if="customer.tax_number">
                                            <span class="text-color-secondary text-sm">Adószám</span>
                                            <div class="font-medium">{{ customer.tax_number }}</div>
                                        </div>
                                        <div v-if="customer.registration_number">
                                            <span class="text-color-secondary text-sm">Cégjegyzékszám</span>
                                            <div class="font-medium">{{ customer.registration_number }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Contacts -->
                                <div class="col-12 md:col-6">
                                    <h5 class="mb-3">Elérhetőségek</h5>
                                    <div v-if="customer.contacts?.length" class="flex flex-column gap-2">
                                        <div v-for="contact in customer.contacts" :key="contact.id" class="flex align-items-center gap-2">
                                            <i :class="`pi pi-${contact.contact_type === 'email' ? 'envelope' : 'phone'} text-color-secondary`"></i>
                                            <span>{{ contact.value }}</span>
                                            <Tag v-if="contact.is_primary" value="Elsődleges" severity="info" class="text-xs" />
                                        </div>
                                    </div>
                                    <span v-else class="text-color-secondary">Nincs elérhetőség</span>
                                </div>

                                <!-- Addresses -->
                                <div class="col-12">
                                    <h5 class="mb-3">Címek</h5>
                                    <div v-if="customer.addresses?.length" class="grid">
                                        <div v-for="address in customer.addresses" :key="address.id" class="col-12 md:col-6">
                                            <div class="surface-100 border-round p-3">
                                                <div class="flex align-items-center gap-2 mb-2">
                                                    <span class="font-medium">{{ address.address_type_display }}</span>
                                                    <Tag v-if="address.is_primary" value="Elsődleges" severity="info" class="text-xs" />
                                                </div>
                                                <div class="text-color-secondary">
                                                    {{ address.full_address }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span v-else class="text-color-secondary">Nincs cím</span>
                                </div>

                                <!-- Notes -->
                                <div v-if="customer.notes" class="col-12">
                                    <h5 class="mb-3">Megjegyzés</h5>
                                    <p class="m-0 text-color-secondary">{{ customer.notes }}</p>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header="Megrendelések">
                            <DataTable :value="customerOrders" responsiveLayout="scroll" class="p-datatable-sm">
                                <template #empty>
                                    <div class="text-center py-4 text-color-secondary">
                                        Még nincs megrendelés
                                    </div>
                                </template>
                                <Column field="reference_number" header="Azonosító">
                                    <template #body="{ data }">
                                        <router-link :to="`/orders/${data.id}`" class="text-primary font-medium">
                                            {{ data.reference_number }}
                                        </router-link>
                                    </template>
                                </Column>
                                <Column field="name" header="Megnevezés"></Column>
                                <Column field="status_name" header="Státusz">
                                    <template #body="{ data }">
                                        <Tag :value="data.status_name" :style="{ backgroundColor: data.status_color }" />
                                    </template>
                                </Column>
                                <Column field="created_at" header="Dátum">
                                    <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
                                </Column>
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>

                <!-- Sidebar -->
                <div class="col-12 lg:col-4">
                    <!-- Quick Actions -->
                    <div class="card mb-4">
                        <h5 class="mb-3">Gyors műveletek</h5>
                        <div class="flex flex-column gap-2">
                            <Button 
                                label="Új megrendelés" 
                                icon="pi pi-plus" 
                                class="w-full"
                                @click="router.push(`/orders/new?customer=${customerId}`)"
                            />
                            <Button 
                                label="Email küldése" 
                                icon="pi pi-envelope" 
                                severity="secondary"
                                outlined
                                class="w-full"
                                :disabled="!customer.primary_email"
                            />
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="card mb-4">
                        <h5 class="mb-3">Statisztika</h5>
                        <div class="flex flex-column gap-3">
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Összes megrendelés</span>
                                <span class="font-medium">{{ customerOrders.length }}</span>
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Létrehozva</span>
                                <span class="font-medium">{{ formatDate(customer.created_at) }}</span>
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Módosítva</span>
                                <span class="font-medium">{{ formatDate(customer.updated_at) }}</span>
                            </div>
                            <div v-if="customer.created_by_name" class="flex justify-content-between">
                                <span class="text-color-secondary">Létrehozta</span>
                                <span class="font-medium">{{ customer.created_by_name }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Persons (for business) -->
                    <div v-if="customer.customer_type === 'business' && customer.contact_persons?.length" class="card">
                        <h5 class="mb-3">Kapcsolattartók</h5>
                        <div class="flex flex-column gap-3">
                            <div v-for="person in customer.contact_persons" :key="person.id" class="flex align-items-start gap-3">
                                <Avatar :label="person.full_name?.charAt(0)" shape="circle" />
                                <div>
                                    <div class="font-medium">{{ person.full_name }}</div>
                                    <div class="text-sm text-color-secondary">{{ person.position }}</div>
                                    <div v-if="person.email" class="text-sm">
                                        <a :href="`mailto:${person.email}`" class="text-primary">{{ person.email }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
