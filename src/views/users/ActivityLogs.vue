<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useDebounceFn } from '@vueuse/core';
import { usersApi } from '@/api/users';

const toast = useToast();

const loading = ref(true);
const logs = ref([]);
const totalRecords = ref(0);

const filters = ref({
    search: '',
    user: null,
    action: null
});

const lazyParams = ref({
    first: 0,
    rows: 25,
    sortField: 'created_at',
    sortOrder: -1
});

const users = ref([]);
const actions = [
    { label: 'Létrehozás', value: 'create' },
    { label: 'Módosítás', value: 'update' },
    { label: 'Törlés', value: 'delete' },
    { label: 'Bejelentkezés', value: 'login' },
    { label: 'Kijelentkezés', value: 'logout' }
];

const loadLogs = async () => {
    loading.value = true;
    try {
        const params = {
            page: Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1,
            page_size: lazyParams.value.rows,
            ordering: lazyParams.value.sortOrder === 1 ? lazyParams.value.sortField : `-${lazyParams.value.sortField}`,
            search: filters.value.search || undefined,
            user: filters.value.user || undefined,
            action: filters.value.action || undefined
        };
        const response = await usersApi.activityLogs(params);
        logs.value = response.results || [];
        totalRecords.value = response.count || 0;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const loadUsers = async () => {
    try {
        const response = await usersApi.dropdown();
        users.value = response || [];
    } catch (error) {
        console.error('Failed to load users:', error);
    }
};

const debouncedLoad = useDebounceFn(loadLogs, 500);

watch(() => filters.value.search, () => {
    lazyParams.value.first = 0;
    debouncedLoad();
});

const onPage = (event) => {
    lazyParams.value.first = event.first;
    lazyParams.value.rows = event.rows;
    loadLogs();
};

const onSort = (event) => {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    loadLogs();
};

const formatDate = (date) => {
    return new Date(date).toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getActionSeverity = (action) => {
    const severities = {
        create: 'success',
        update: 'info',
        delete: 'danger',
        login: 'warning',
        logout: 'secondary'
    };
    return severities[action] || 'secondary';
};

const getActionLabel = (action) => {
    return actions.find(a => a.value === action)?.label || action;
};

onMounted(() => {
    loadUsers();
    loadLogs();
});
</script>

<template>
    <div class="card">
        <Toast />

        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="m-0 text-2xl font-semibold">Tevékenység napló</h2>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-4">
            <IconField iconPosition="left" class="flex-1" style="min-width: 200px">
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters.search" placeholder="Keresés..." class="w-full" />
            </IconField>
            <Select 
                v-model="filters.user" 
                :options="users"
                optionLabel="full_name"
                optionValue="id"
                placeholder="Felhasználó"
                class="w-12rem"
                showClear
                @change="loadLogs"
            />
            <Select 
                v-model="filters.action" 
                :options="actions"
                optionLabel="label"
                optionValue="value"
                placeholder="Művelet"
                class="w-10rem"
                showClear
                @change="loadLogs"
            />
        </div>

        <DataTable 
            :value="logs"
            :loading="loading"
            :lazy="true"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[25, 50, 100]"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            dataKey="id"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            @page="onPage"
            @sort="onSort"
        >
            <template #empty>
                <div class="text-center py-5 text-color-secondary">Nincs találat</div>
            </template>
            <Column field="created_at" header="Időpont" sortable style="width: 12rem">
                <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
            </Column>
            <Column field="user_name" header="Felhasználó" sortable></Column>
            <Column field="action" header="Művelet" style="width: 10rem">
                <template #body="{ data }">
                    <Tag :value="getActionLabel(data.action)" :severity="getActionSeverity(data.action)" />
                </template>
            </Column>
            <Column field="target_type" header="Típus"></Column>
            <Column field="description" header="Leírás"></Column>
            <Column field="ip_address" header="IP cím" style="width: 10rem"></Column>
        </DataTable>
    </div>
</template>
