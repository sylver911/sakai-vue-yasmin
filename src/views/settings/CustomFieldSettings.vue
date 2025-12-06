<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { settingsApi } from '@/api/settings';

const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const saving = ref(false);
const customFields = ref([]);
const dialogVisible = ref(false);
const editingField = ref(null);

const fieldTypes = [
    { label: 'Szöveg', value: 'text' },
    { label: 'Szám', value: 'number' },
    { label: 'Dátum', value: 'date' },
    { label: 'Igen/Nem', value: 'boolean' },
    { label: 'Legördülő', value: 'select' },
    { label: 'Többszörös választás', value: 'multiselect' },
    { label: 'Többsoros szöveg', value: 'textarea' }
];

const targetTypes = [
    { label: 'Ügyfél', value: 'customer' },
    { label: 'Megrendelés', value: 'order' }
];

const fieldForm = ref({
    name: '',
    field_type: 'text',
    target_type: 'customer',
    options: '',
    placeholder: '',
    is_required: false,
    is_active: true,
    sort_order: 0
});

const loadCustomFields = async () => {
    loading.value = true;
    try {
        const response = await settingsApi.customFields.list();
        customFields.value = response.results || response || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openDialog = (field = null) => {
    editingField.value = field;
    if (field) {
        fieldForm.value = { 
            ...field,
            options: Array.isArray(field.options) ? field.options.join('\n') : field.options || ''
        };
    } else {
        fieldForm.value = {
            name: '',
            field_type: 'text',
            target_type: 'customer',
            options: '',
            placeholder: '',
            is_required: false,
            is_active: true,
            sort_order: customFields.value.length
        };
    }
    dialogVisible.value = true;
};

const saveField = async () => {
    if (!fieldForm.value.name.trim()) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'A név megadása kötelező', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        const payload = {
            ...fieldForm.value,
            options: fieldForm.value.options ? fieldForm.value.options.split('\n').filter(o => o.trim()) : []
        };

        if (editingField.value) {
            await settingsApi.customFields.update(editingField.value.id, payload);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Mező frissítve', life: 3000 });
        } else {
            await settingsApi.customFields.create(payload);
            toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Mező létrehozva', life: 3000 });
        }
        dialogVisible.value = false;
        loadCustomFields();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Mentési hiba', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const confirmDelete = (field) => {
    confirm.require({
        message: `Biztosan törölni szeretné a "${field.name}" mezőt?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await settingsApi.customFields.delete(field.id);
                toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Mező törölve', life: 3000 });
                loadCustomFields();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült törölni', life: 3000 });
            }
        }
    });
};

onMounted(() => {
    loadCustomFields();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="m-0 text-2xl font-semibold">Egyedi mezők</h2>
            <Button label="Új mező" icon="pi pi-plus" @click="openDialog()" />
        </div>

        <div v-if="loading" class="flex justify-content-center py-5">
            <ProgressSpinner />
        </div>

        <DataTable v-else :value="customFields" responsiveLayout="scroll" class="p-datatable-sm">
            <template #empty>
                <div class="text-center py-5 text-color-secondary">Még nincs egyedi mező</div>
            </template>
            <Column field="name" header="Név" sortable></Column>
            <Column field="field_type" header="Típus">
                <template #body="{ data }">
                    {{ fieldTypes.find(t => t.value === data.field_type)?.label }}
                </template>
            </Column>
            <Column field="target_type" header="Cél">
                <template #body="{ data }">
                    <Tag :value="data.target_type === 'customer' ? 'Ügyfél' : 'Megrendelés'" :severity="data.target_type === 'customer' ? 'success' : 'info'" />
                </template>
            </Column>
            <Column header="Kötelező">
                <template #body="{ data }">
                    <i :class="data.is_required ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
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
            :header="editingField ? 'Mező szerkesztése' : 'Új mező'"
            :style="{ width: '500px' }"
            modal
        >
            <div class="flex flex-column gap-4">
                <div>
                    <label class="block text-900 font-medium mb-2">Név *</label>
                    <InputText v-model="fieldForm.name" class="w-full" />
                </div>
                <div class="grid">
                    <div class="col-6">
                        <label class="block text-900 font-medium mb-2">Típus *</label>
                        <Select v-model="fieldForm.field_type" :options="fieldTypes" optionLabel="label" optionValue="value" class="w-full" />
                    </div>
                    <div class="col-6">
                        <label class="block text-900 font-medium mb-2">Cél *</label>
                        <Select v-model="fieldForm.target_type" :options="targetTypes" optionLabel="label" optionValue="value" class="w-full" />
                    </div>
                </div>
                <div v-if="fieldForm.field_type === 'select' || fieldForm.field_type === 'multiselect'">
                    <label class="block text-900 font-medium mb-2">Opciók (soronként egy)</label>
                    <Textarea v-model="fieldForm.options" class="w-full" rows="4" placeholder="Opció 1&#10;Opció 2&#10;Opció 3" />
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Helyőrző szöveg</label>
                    <InputText v-model="fieldForm.placeholder" class="w-full" />
                </div>
                <div class="flex gap-4">
                    <div class="flex align-items-center">
                        <Checkbox v-model="fieldForm.is_required" :binary="true" inputId="is_required" />
                        <label for="is_required" class="ml-2">Kötelező</label>
                    </div>
                    <div class="flex align-items-center">
                        <Checkbox v-model="fieldForm.is_active" :binary="true" inputId="is_active" />
                        <label for="is_active" class="ml-2">Aktív</label>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Mégse" severity="secondary" outlined @click="dialogVisible = false" />
                <Button label="Mentés" icon="pi pi-check" :loading="saving" @click="saveField" />
            </template>
        </Dialog>
    </div>
</template>
