<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { customersApi } from '@/api/customers';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const customers = ref([]);
const loading = ref(true);
const totalRecords = ref(0);
const selectedCustomers = ref([]);

const filters = ref({
    search: '',
    customer_type: null,
    is_active: null,
    has_orders: null
});

const lazyParams = ref({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'created_at',
    sortOrder: -1
});

const customerTypes = [
    { label: 'Magánszemély', value: 'individual' },
    { label: 'Vállalkozás', value: 'business' }
];

const activeOptions = [
    { label: 'Aktív', value: true },
    { label: 'Inaktív', value: false }
];

const loadData = async () => {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            search: filters.value.search || undefined,
            customer_type: filters.value.customer_type || undefined,
            is_active: filters.value.is_active ?? undefined,
            has_orders: filters.value.has_orders ?? undefined,
            ordering: lazyParams.value.sortOrder === 1 
                ? lazyParams.value.sortField 
                : `-${lazyParams.value.sortField}`
        };

        const response = await customersApi.list(params);
        customers.value = response.results;
        totalRecords.value = response.count;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Hiba',
            detail: 'Nem sikerült betölteni az ügyfeleket',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.first = event.first;
    lazyParams.value.rows = event.rows;
    lazyParams.value.page = event.page + 1;
    loadData();
};

const onSort = (event) => {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    loadData();
};

const clearFilters = () => {
    filters.value = {
        search: '',
        customer_type: null,
        is_active: null,
        has_orders: null
    };
    loadData();
};

let searchTimeout = null;
watch(() => filters.value.search, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        lazyParams.value.page = 1;
        loadData();
    }, 500);
});

const confirmDelete = (customer) => {
    confirm.require({
        message: `Biztosan törölni szeretné "${customer.display_name}" ügyfelet?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await customersApi.delete(customer.id);
                toast.add({
                    severity: 'success',
                    summary: 'Sikeres',
                    detail: 'Ügyfél törölve',
                    life: 3000
                });
                loadData();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Hiba',
                    detail: 'Nem sikerült törölni az ügyfelet',
                    life: 3000
                });
            }
        }
    });
};

const exportData = () => {
    // TODO: Implement export
    toast.add({
        severity: 'info',
        summary: 'Exportálás',
        detail: 'Az exportálás hamarosan elérhető lesz',
        life: 3000
    });
};

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />
        
        <!-- Header -->
        <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
            <div>
                <h2 class="m-0 text-2xl font-semibold">Ügyfelek</h2>
                <p class="mt-1 mb-0 text-color-secondary">Ügyfélnyilvántartás kezelése</p>
            </div>
            <div class="flex gap-2">
                <Button 
                    label="Exportálás" 
                    icon="pi pi-download" 
                    severity="secondary" 
                    outlined
                    @click="exportData"
                />
                <Button 
                    label="Új ügyfél" 
                    icon="pi pi-plus" 
                    @click="router.push('/customers/new')"
                />
            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-column md:flex-row gap-3 mb-4">
            <IconField iconPosition="left" class="flex-1">
                <InputIcon class="pi pi-search" />
                <InputText 
                    v-model="filters.search" 
                    placeholder="Keresés név, email, azonosító alapján..." 
                    class="w-full"
                />
            </IconField>
            <Select 
                v-model="filters.customer_type" 
                :options="customerTypes" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Típus" 
                class="w-full md:w-12rem"
                showClear
                @change="loadData"
            />
            <Select 
                v-model="filters.is_active" 
                :options="activeOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Státusz" 
                class="w-full md:w-10rem"
                showClear
                @change="loadData"
            />
            <Button 
                icon="pi pi-filter-slash" 
                severity="secondary" 
                outlined
                v-tooltip="'Szűrők törlése'"
                @click="clearFilters"
            />
        </div>

        <!-- Data Table -->
        <DataTable 
            v-model:selection="selectedCustomers"
            :value="customers" 
            :loading="loading"
            :lazy="true"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[10, 25, 50]"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            dataKey="id"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} - {last} / {totalRecords} ügyfél"
            @page="onPage"
            @sort="onSort"
        >
            <template #empty>
                <div class="text-center py-5">
                    <i class="pi pi-users text-4xl text-color-secondary mb-3"></i>
                    <p class="m-0 text-color-secondary">Nincs találat</p>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            
            <Column field="display_name" header="Név" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <Avatar 
                            :label="data.display_name?.charAt(0)" 
                            :style="{ backgroundColor: data.customer_type === 'business' ? '#3B82F6' : '#22C55E' }"
                            class="mr-2"
                            shape="circle"
                        />
                        <div>
                            <router-link 
                                :to="`/customers/${data.id}`" 
                                class="font-medium text-primary hover:underline"
                            >
                                {{ data.display_name }}
                            </router-link>
                            <div class="text-sm text-color-secondary">{{ data.identifier || '-' }}</div>
                        </div>
                    </div>
                </template>
            </Column>

            <Column field="customer_type_display" header="Típus" sortable style="width: 10rem">
                <template #body="{ data }">
                    <Tag 
                        :value="data.customer_type_display" 
                        :severity="data.customer_type === 'business' ? 'info' : 'success'"
                    />
                </template>
            </Column>

            <Column field="primary_email" header="Email" style="min-width: 12rem">
                <template #body="{ data }">
                    <a v-if="data.primary_email" :href="`mailto:${data.primary_email}`" class="text-primary">
                        {{ data.primary_email }}
                    </a>
                    <span v-else class="text-color-secondary">-</span>
                </template>
            </Column>

            <Column field="primary_phone" header="Telefon" style="min-width: 10rem">
                <template #body="{ data }">
                    <a v-if="data.primary_phone" :href="`tel:${data.primary_phone}`" class="text-primary">
                        {{ data.primary_phone }}
                    </a>
                    <span v-else class="text-color-secondary">-</span>
                </template>
            </Column>

            <Column field="is_active" header="Státusz" style="width: 8rem">
                <template #body="{ data }">
                    <Tag 
                        :value="data.is_active ? 'Aktív' : 'Inaktív'" 
                        :severity="data.is_active ? 'success' : 'danger'"
                    />
                </template>
            </Column>

            <Column field="created_at" header="Létrehozva" sortable style="width: 10rem">
                <template #body="{ data }">
                    {{ new Date(data.created_at).toLocaleDateString('hu-HU') }}
                </template>
            </Column>

            <Column header="Műveletek" style="width: 8rem" frozen alignFrozen="right">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button 
                            icon="pi pi-eye" 
                            rounded 
                            text 
                            severity="info"
                            v-tooltip="'Megtekintés'"
                            @click="router.push(`/customers/${data.id}`)"
                        />
                        <Button 
                            icon="pi pi-pencil" 
                            rounded 
                            text 
                            severity="secondary"
                            v-tooltip="'Szerkesztés'"
                            @click="router.push(`/customers/${data.id}/edit`)"
                        />
                        <Button 
                            icon="pi pi-trash" 
                            rounded 
                            text 
                            severity="danger"
                            v-tooltip="'Törlés'"
                            @click="confirmDelete(data)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
