<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const toast = useToast();
const authStore = useAuthStore();

const saving = ref(false);
const changingPassword = ref(false);

const profileForm = ref({
    first_name: authStore.user?.first_name || '',
    last_name: authStore.user?.last_name || '',
    email: authStore.user?.email || ''
});

const passwordForm = ref({
    current_password: '',
    new_password: '',
    confirm_password: ''
});

const user = computed(() => authStore.user);

const updateProfile = async () => {
    saving.value = true;
    try {
        await authStore.updateProfile(profileForm.value);
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Profil frissítve', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Nem sikerült frissíteni', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const changePassword = async () => {
    if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'A jelszavak nem egyeznek', life: 3000 });
        return;
    }

    if (passwordForm.value.new_password.length < 8) {
        toast.add({ severity: 'warn', summary: 'Figyelem', detail: 'A jelszónak legalább 8 karakter hosszúnak kell lennie', life: 3000 });
        return;
    }

    changingPassword.value = true;
    try {
        await authStore.changePassword(passwordForm.value.current_password, passwordForm.value.new_password);
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Jelszó megváltoztatva', life: 3000 });
        passwordForm.value = { current_password: '', new_password: '', confirm_password: '' };
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: error.data?.detail || 'Nem sikerült megváltoztatni', life: 3000 });
    } finally {
        changingPassword.value = false;
    }
};
</script>

<template>
    <div class="grid">
        <Toast />
        
        <!-- Profile Card -->
        <div class="col-12 lg:col-6">
            <div class="card">
                <h2 class="m-0 mb-4 text-2xl font-semibold">Profil beállítások</h2>
                
                <div class="flex align-items-center gap-4 mb-5">
                    <Avatar 
                        :label="user?.full_name?.charAt(0) || 'U'" 
                        size="xlarge"
                        class="bg-primary text-white"
                        shape="circle"
                    />
                    <div>
                        <h3 class="m-0">{{ user?.full_name || 'Felhasználó' }}</h3>
                        <p class="m-0 text-color-secondary">{{ user?.email }}</p>
                        <Tag :value="user?.role_display" class="mt-2" />
                    </div>
                </div>

                <div class="flex flex-column gap-4">
                    <div class="grid">
                        <div class="col-6">
                            <label class="block text-900 font-medium mb-2">Vezetéknév</label>
                            <InputText v-model="profileForm.last_name" class="w-full" />
                        </div>
                        <div class="col-6">
                            <label class="block text-900 font-medium mb-2">Keresztnév</label>
                            <InputText v-model="profileForm.first_name" class="w-full" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-900 font-medium mb-2">Email</label>
                        <InputText v-model="profileForm.email" type="email" class="w-full" disabled />
                        <small class="text-color-secondary">Az email cím nem módosítható</small>
                    </div>
                    <Button label="Mentés" icon="pi pi-check" :loading="saving" @click="updateProfile" />
                </div>
            </div>
        </div>

        <!-- Password Card -->
        <div class="col-12 lg:col-6">
            <div class="card">
                <h2 class="m-0 mb-4 text-2xl font-semibold">Jelszó módosítása</h2>
                
                <div class="flex flex-column gap-4">
                    <div>
                        <label class="block text-900 font-medium mb-2">Jelenlegi jelszó</label>
                        <Password v-model="passwordForm.current_password" class="w-full" inputClass="w-full" :feedback="false" toggleMask />
                    </div>
                    <div>
                        <label class="block text-900 font-medium mb-2">Új jelszó</label>
                        <Password v-model="passwordForm.new_password" class="w-full" inputClass="w-full" toggleMask />
                    </div>
                    <div>
                        <label class="block text-900 font-medium mb-2">Új jelszó megerősítése</label>
                        <Password v-model="passwordForm.confirm_password" class="w-full" inputClass="w-full" :feedback="false" toggleMask />
                    </div>
                    <Button 
                        label="Jelszó módosítása" 
                        icon="pi pi-lock" 
                        severity="warning"
                        :loading="changingPassword" 
                        :disabled="!passwordForm.current_password || !passwordForm.new_password"
                        @click="changePassword" 
                    />
                </div>
            </div>
        </div>
    </div>
</template>
