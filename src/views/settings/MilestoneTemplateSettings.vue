<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { settingsApi } from '@/api/settings';

const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const saving = ref(false);
const templates = ref([]);
const dialogVisible = ref(false);
const editingTemplate = ref(null);

const offsetFromOptions = [
    { label: 'Megrendelés dátumától', value: 'order_date' },
    { label: 'Határidőtől', value: 'deadline' }
];

const templateForm = ref({
    name: '',
    description: '',
    days_offset: 0,
    offset_from: 'order_date',
    color: '#3B82F6',
    is_active: true,
    sort_order: 0
});

const loadTemplates = async () => {
    loading.value = true;
    try {
        const response = await settingsApi.milestoneTemplates.list();
        templates.value = response.results || response || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openDialog = (template = null) => {
    editingTemplate.value = template;
    if (template) {
        templateForm.value = { ...template };
    } else {
        templateForm.value = {
            name: '',
            description: '',
            days_offset: 0,
            offset_from: 'order_date',
            color: '#3B82F6',
            is_active: true,
            sort_order: templates.value.length
        };
    }
    dialogVisible.value = true;
};

const saveTemplate = async () => {
    if (!templateForm.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'A név megadása kötelező', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        if (editingTemplate.value) {
            await settingsApi.milestoneTemplates.update(editingTemplate.value.id, templateForm.value);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Sablon frissítve', life: 3000 });
        } else {
            await settingsApi.milestoneTemplates.create(templateForm.value);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Sablon létrehozva', life: 3000 });
        }
        dialogVisible.value = false;
        loadTemplates();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Mentési hiba', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (template) => {
    confirm.require({
        message: `Biztosan törölni szeretné a "${template.name}" sablont?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await settingsApi.milestoneTemplates.delete(template.id);
                toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Sablon törölve', life: 3000 });
                loadTemplates();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    loadTemplates();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="m-0 text-2xl font-semibold">Mérföldkő sablonok</h2>
            <Button label="Új sablon" icon="pi pi-plus" @click="openDialog()" />
        </div>

        <div v-if="loading" class="flex justify-content-center py-5">
            <ProgressSpinner />
        </div>

        <DataTable v-else :value="templates" responsiveLayout="scroll" class="p-datatable-sm">
            <template #empty>
                <div class="text-center py-5 text-color-secondary">Még nincs sablon</div>
            </template>
            <Column header="Szín" style="width: 5rem">
                <template #body="{ data }">
                    <span class="w-2rem h-2rem border-round inline-block" :style="{ backgroundColor: data.color }"></span>
                </template>
            </Column>
            <Column field="name" header="Név" sortable></Column>
            <Column field="days_offset" header="Napok">
                <template #body="{ data }">
                    {{ data.days_offset >= 0 ? '+' : '' }}{{ data.days_offset }} nap
                </template>
            </Column>
            <Column field="offset_from" header="Referencia">
                <template #body="{ data }">
                    {{ offsetFromOptions.find(o => o.value === data.offset_from)?.label }}
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
        <Dialog v-model:visible="dialogVisible" :header="editingTemplate ? 'Sablon szerkesztése' : 'Új sablon'" :style="{ width: '500px' }" modal>
            <div class="flex flex-column gap-4">
                <div>
                    <label class="block text-900 font-medium mb-2">Név *</label>
                    <InputText v-model="templateForm.name" class="w-full" />
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Leírás</label>
                    <Textarea v-model="templateForm.description" class="w-full" rows="2" />
                </div>
                <div class="grid">
                    <div class="col-6">
                        <label class="block text-900 font-medium mb-2">Napok eltérés</label>
                        <InputNumber v-model="templateForm.days_offset" class="w-full" showButtons />
                    </div>
                    <div class="col-6">
                        <label class="block text-900 font-medium mb-2">Referencia dátum</label>
                        <Select v-model="templateForm.offset_from" :options="offsetFromOptions" optionLabel="label" optionValue="value" class="w-full" />
                    </div>
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Szín</label>
                    <div class="flex align-items-center gap-3">
                        <ColorPicker v-model="templateForm.color" />
                        <InputText v-model="templateForm.color" class="w-8rem" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Mégse" severity="secondary" outlined @click="dialogVisible = false" />
                <Button label="Mentés" icon="pi pi-check" :loading="saving" @click="saveTemplate" />
            </template>
        </Dialog>
    </div>
</template>
