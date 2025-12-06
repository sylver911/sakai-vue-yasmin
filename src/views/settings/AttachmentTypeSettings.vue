<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { settingsApi } from '@/api/settings';

const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const saving = ref(false);
const attachmentTypes = ref([]);
const dialogVisible = ref(false);
const editingType = ref(null);

const typeForm = ref({
    name: '',
    description: '',
    allowed_extensions: '',
    max_file_size_mb: 10,
    is_active: true,
    sort_order: 0
});

const loadAttachmentTypes = async () => {
    loading.value = true;
    try {
        const response = await settingsApi.attachmentTypes.list();
        attachmentTypes.value = response.results || response || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openDialog = (type = null) => {
    editingType.value = type;
    if (type) {
        typeForm.value = { 
            ...type,
            allowed_extensions: Array.isArray(type.allowed_extensions) ? type.allowed_extensions.join(', ') : type.allowed_extensions || ''
        };
    } else {
        typeForm.value = {
            name: '',
            description: '',
            allowed_extensions: '.pdf, .doc, .docx, .jpg, .png',
            max_file_size_mb: 10,
            is_active: true,
            sort_order: attachmentTypes.value.length
        };
    }
    dialogVisible.value = true;
};

const saveType = async () => {
    if (!typeForm.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'A név megadása kötelező', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        const payload = {
            ...typeForm.value,
            allowed_extensions: typeForm.value.allowed_extensions 
                ? typeForm.value.allowed_extensions.split(',').map(e => e.trim()).filter(e => e)
                : []
        };

        if (editingType.value) {
            await settingsApi.attachmentTypes.update(editingType.value.id, payload);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Típus frissítve', life: 3000 });
        } else {
            await settingsApi.attachmentTypes.create(payload);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Típus létrehozva', life: 3000 });
        }
        dialogVisible.value = false;
        loadAttachmentTypes();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Mentési hiba', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (type) => {
    confirm.require({
        message: `Biztosan törölni szeretné a "${type.name}" típust?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await settingsApi.attachmentTypes.delete(type.id);
                toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Típus törölve', life: 3000 });
                loadAttachmentTypes();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    loadAttachmentTypes();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="m-0 text-2xl font-semibold">Csatolmány típusok</h2>
            <Button label="Új típus" icon="pi pi-plus" @click="openDialog()" />
        </div>

        <div v-if="loading" class="flex justify-content-center py-5">
            <ProgressSpinner />
        </div>

        <DataTable v-else :value="attachmentTypes" responsiveLayout="scroll" class="p-datatable-sm">
            <template #empty>
                <div class="text-center py-5 text-color-secondary">Még nincs csatolmány típus</div>
            </template>
            <Column field="name" header="Név" sortable></Column>
            <Column field="description" header="Leírás"></Column>
            <Column field="allowed_extensions" header="Engedélyezett kiterjesztések">
                <template #body="{ data }">
                    <div class="flex flex-wrap gap-1">
                        <Tag v-for="ext in (Array.isArray(data.allowed_extensions) ? data.allowed_extensions : [])" :key="ext" :value="ext" severity="secondary" class="text-xs" />
                    </div>
                </template>
            </Column>
            <Column field="max_file_size_mb" header="Max méret">
                <template #body="{ data }">{{ data.max_file_size_mb }} MB</template>
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
        <Dialog v-model:visible="dialogVisible" :header="editingType ? 'Típus szerkesztése' : 'Új típus'" :style="{ width: '500px' }" modal>
            <div class="flex flex-column gap-4">
                <div>
                    <label class="block text-900 font-medium mb-2">Név *</label>
                    <InputText v-model="typeForm.name" class="w-full" />
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Leírás</label>
                    <Textarea v-model="typeForm.description" class="w-full" rows="2" />
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Engedélyezett kiterjesztések</label>
                    <InputText v-model="typeForm.allowed_extensions" class="w-full" placeholder=".pdf, .doc, .jpg" />
                    <small class="text-color-secondary">Vesszővel elválasztva</small>
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Maximum fájlméret (MB)</label>
                    <InputNumber v-model="typeForm.max_file_size_mb" class="w-full" :min="1" :max="100" suffix=" MB" />
                </div>
                <div class="flex align-items-center">
                    <Checkbox v-model="typeForm.is_active" :binary="true" inputId="is_active" />
                    <label for="is_active" class="ml-2">Aktív</label>
                </div>
            </div>
            <template #footer>
                <Button label="Mégse" severity="secondary" outlined @click="dialogVisible = false" />
                <Button label="Mentés" icon="pi pi-check" :loading="saving" @click="saveType" />
            </template>
        </Dialog>
    </div>
</template>
