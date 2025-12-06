<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { usersApi } from '@/api/users';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const users = ref([]);
const dialogVisible = ref(false);
const saving = ref(false);

const roles = [
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Munkatárs', value: 'staff' },
    { label: 'Csak olvasás', value: 'readonly' }
];

const userForm = ref({
    email: '',
    first_name: '',
    last_name: '',
    role: 'staff',
    password: ''
});

const loadUsers = async () => {
    loading.value = true;
    try {
        const response = await usersApi.list();
        users.value = response.results || response || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openDialog = () => {
    userForm.value = {
        email: '',
        first_name: '',
        last_name: '',
        role: 'staff',
        password: ''
    };
    dialogVisible.value = true;
};

const createUser = async () => {
    if (!userForm.value.email || !userForm.value.password) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'Email és jelszó kötelező', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        await usersApi.create(userForm.value);
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Felhasználó létrehozva', life: 3000 });
        dialogVisible.value = false;
        loadUsers();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Létrehozási hiba', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const toggleActive = async (user) => {
    try {
        await usersApi.toggleActive(user.id);
        user.is_active = !user.is_active;
        toast.add({ severity: 'success', summary: 'Sikeres', detail: `Felhasználó ${user.is_active ? 'aktiválva' : 'deaktiválva'}`, life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült módosítani', life: 3000 });
    }
};

const changeRole = async (user, newRole) => {
    try {
        await usersApi.changeRole(user.id, newRole);
        user.role = newRole;
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Jogosultság módosítva', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült módosítani', life: 3000 });
    }
};

const getRoleSeverity = (role) => {
    const severities = {
        super_admin: 'danger',
        admin: 'warning',
        staff: 'info',
        readonly: 'secondary'
    };
    return severities[role] || 'secondary';
};

const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role;
};

onMounted(() => {
    loadUsers();
});
</script>

<template>
    <div class="card">
        <Toast />
        <ConfirmDialog />

        <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="m-0 text-2xl font-semibold">Felhasználók</h2>
            <Button label="Új felhasználó" icon="pi pi-plus" @click="openDialog()" />
        </div>

        <div v-if="loading" class="flex justify-content-center py-5">
            <ProgressSpinner />
        </div>

        <DataTable v-else :value="users" responsiveLayout="scroll" class="p-datatable-sm">
            <template #empty>
                <div class="text-center py-5 text-color-secondary">Nincs felhasználó</div>
            </template>
            <Column header="Felhasználó">
                <template #body="{ data }">
                    <div class="flex align-items-center gap-3">
                        <Avatar :label="data.full_name?.charAt(0) || data.email?.charAt(0)" shape="circle" />
                        <div>
                            <div class="font-medium">{{ data.full_name || data.email }}</div>
                            <div class="text-sm text-color-secondary">{{ data.email }}</div>
                        </div>
                    </div>
                </template>
            </Column>
            <Column field="role" header="Jogosultság">
                <template #body="{ data }">
                    <Select 
                        :modelValue="data.role" 
                        :options="roles"
                        optionLabel="label"
                        optionValue="value"
                        class="w-10rem"
                        @update:modelValue="(val) => changeRole(data, val)"
                    />
                </template>
            </Column>
            <Column header="Állapot" style="width: 8rem">
                <template #body="{ data }">
                    <Tag :value="data.is_active ? 'Aktív' : 'Inaktív'" :severity="data.is_active ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column header="Műveletek" style="width: 10rem">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button icon="pi pi-eye" rounded text severity="info" @click="router.push(`/users/${data.id}`)" v-tooltip="'Részletek'" />
                        <Button 
                            :icon="data.is_active ? 'pi pi-lock' : 'pi pi-lock-open'" 
                            rounded text 
                            :severity="data.is_active ? 'warning' : 'success'"
                            @click="toggleActive(data)"
                            v-tooltip="data.is_active ? 'Deaktiválás' : 'Aktiválás'"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Create Dialog -->
        <Dialog v-model:visible="dialogVisible" header="Új felhasználó" :style="{ width: '450px' }" modal>
            <div class="flex flex-column gap-4">
                <div>
                    <label class="block text-900 font-medium mb-2">Email *</label>
                    <InputText v-model="userForm.email" type="email" class="w-full" />
                </div>
                <div class="grid">
                    <div class="col-6">
                        <label class="block text-900 font-medium mb-2">Vezetéknév</label>
                        <InputText v-model="userForm.last_name" class="w-full" />
                    </div>
                    <div class="col-6">
                        <label class="block text-900 font-medium mb-2">Keresztnév</label>
                        <InputText v-model="userForm.first_name" class="w-full" />
                    </div>
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Jogosultság</label>
                    <Select v-model="userForm.role" :options="roles" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div>
                    <label class="block text-900 font-medium mb-2">Jelszó *</label>
                    <Password v-model="userForm.password" class="w-full" inputClass="w-full" toggleMask />
                </div>
            </div>
            <template #footer>
                <Button label="Mégse" severity="secondary" outlined @click="dialogVisible = false" />
                <Button label="Létrehozás" icon="pi pi-check" :loading="saving" @click="createUser" />
            </template>
        </Dialog>
    </div>
</template>
