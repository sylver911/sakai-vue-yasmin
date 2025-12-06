<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { settingsApi } from '@/api/settings';

const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const saving = ref(false);
const statuses = ref([]);
const dialogVisible = ref(false);
const editingStatus = ref(null);

const statusForm = ref({
    name: '',
    color: '#3B82F6',
    description: '',
    is_active: true,
    is_default: false,
    sort_order: 0
});

const loadStatuses = async () => {
    loading.value = true;
    try {
        const response = await settingsApi.statuses.list();
        statuses.value = response.results || response || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openDialog = (status = null) => {
    editingStatus.value = status;
    if (status) {
        statusForm.value = { ...status };
    } else {
        statusForm.value = {
            name: '',
            color: '#3B82F6',
            description: '',
            is_active: true,
            is_default: false,
            sort_order: statuses.value.length
        };
    }
    dialogVisible.value = true;
};

const saveStatus = async () => {
    if (!statusForm.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'A név megadása kötelező', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        if (editingStatus.value) {
            await settingsApi.statuses.update(editingStatus.value.id, statusForm.value);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Státusz frissítve', life: 3000 });
        } else {
            await settingsApi.statuses.create(statusForm.value);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Státusz létrehozva', life: 3000 });
        }
        dialogVisible.value = false;
        loadStatuses();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Mentési hiba', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (status) => {
    confirm.require({
        message: `Biztosan törölni szeretné a "${status.name}" státuszt?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await settingsApi.statuses.delete(status.id);
                toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Státusz törölve', life: 3000 });
                loadStatuses();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    loadStatuses();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="m-0 text-2xl font-semibold">Státuszok</h2>
            <Button label="Új státusz" icon="pi pi-plus" @click="openDialog()" />
        </div>

        <div v-if="loading" class="flex justify-content-center py-5">
            <ProgressSpinner />
        </div>

        <DataTable v-else :value="statuses" responsiveLayout="scroll" class="p-datatable-sm">
            <template #empty>
                <div class="text-center py-5 text-color-secondary">Még nincs státusz</div>
            </template>
            <Column header="Szín" style="width: 5rem">
                <template #body="{ data }">
                    <span class="w-2rem h-2rem border-round inline-block" :style="{ backgroundColor: data.color }"></span>
                </template>
            </Column>
            <Column field="name" header="Név" sortable></Column>
            <Column field="description" header="Leírás"></Column>
            <Column header="Állapot" style="width: 8rem">
                <template #body="{ data }">
                    <Tag :value="data.is_active ? 'Aktív' : 'Inaktív'" :severity="data.is_active ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column header="Alapértelmezett" style="width: 10rem">
                <template #body="{ data }">
                    <Tag v-if="data.is_default" value="Alapértelmezett" severity="info" />
                </template>
            </Column>
            <Column header="Műveletek" style="width: 8rem">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" rounded text severity="secondary" @click="openDialog(data)" />
                        <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDelete(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Dialog -->
        <Dialog 
            v-model:visible="dialogVisible" 
            :header="editingStatus ? 'Státusz szerkesztése' : 'Új státusz'"
            :style="{ width: '500px' }"
            modal
        >
            <div class="flex flex-column gap-4">
                <div>
                    <label class="block text-900 font-medium mb-2">Név *</label>
                    <InputText v-model="statusForm.name" class="w-full" />
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Szín *</label>
                    <div class="flex align-items-center gap-3">
                        <ColorPicker v-model="statusForm.color" />
                        <InputText v-model="statusForm.color" class="w-8rem" />
                        <Tag :value="statusForm.name || 'Előnézet'" :style="{ backgroundColor: statusForm.color }" />
                    </div>
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Leírás</label>
                    <Textarea v-model="statusForm.description" class="w-full" rows="2" />
                </div>
                <div class="flex gap-4">
                    <div class="flex align-items-center">
                        <Checkbox v-model="statusForm.is_active" :binary="true" inputId="is_active" />
                        <label for="is_active" class="ml-2">Aktív</label>
                    </div>
                    <div class="flex align-items-center">
                        <Checkbox v-model="statusForm.is_default" :binary="true" inputId="is_default" />
                        <label for="is_default" class="ml-2">Alapértelmezett</label>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Mégse" severity="secondary" outlined @click="dialogVisible = false" />
                <Button label="Mentés" icon="pi pi-check" :loading="saving" @click="saveStatus" />
            </template>
        </Dialog>
    </div>
</template>
