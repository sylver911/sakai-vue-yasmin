<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { usersApi } from '@/api/users';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const user = ref(null);
const userActivity = ref([]);

const userId = computed(() => route.params.id);

const roles = [
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Munkatárs', value: 'staff' },
    { label: 'Csak olvasás', value: 'readonly' }
];

const loadUser = async () => {
    loading.value = true;
    try {
        const [userData, activityData] = await Promise.all([
            usersApi.get(userId.value),
            usersApi.activityLogs({ user: userId.value, page_size: 10 })
        ]);
        user.value = userData;
        userActivity.value = activityData.results || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült betölteni', life: 3000 });
        router.push('/users');
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('hu-HU');
};

const toggleActive = async () => {
    try {
        await usersApi.toggleActive(userId.value);
        user.value.is_active = !user.value.is_active;
        toast.add({ severity: 'success', summary: 'Sikeres', detail: `Felhasználó ${user.value.is_active ? 'aktiválva' : 'deaktiválva'}`, life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült módosítani', life: 3000 });
    }
};

const changeRole = async (newRole) => {
    try {
        await usersApi.changeRole(userId.value, newRole);
        user.value.role = newRole;
        toast.add({ severity: 'success', summary: 'Sikeres', detail: 'Jogosultság módosítva', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Hiba', detail: 'Nem sikerült módosítani', life: 3000 });
    }
};

onMounted(() => {
    loadUser();
});
</script>

<template>
    <div>
        <Toast />

        <div v-if="loading" class="card flex justify-content-center py-8">
            <ProgressSpinner />
        </div>

        <template v-else-if="user">
            <div class="card mb-4">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4">
                    <div class="flex align-items-center gap-4">
                        <Avatar 
                            :label="user.full_name?.charAt(0) || user.email?.charAt(0)" 
                            size="xlarge"
                            class="bg-primary text-white"
                            shape="circle"
                        />
                        <div>
                            <div class="flex align-items-center gap-2 mb-2">
                                <h2 class="m-0 text-2xl font-semibold">{{ user.full_name || user.email }}</h2>
                                <Tag :value="user.is_active ? 'Aktív' : 'Inaktív'" :severity="user.is_active ? 'success' : 'danger'" />
                            </div>
                            <p class="m-0 text-color-secondary">{{ user.email }}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <Button icon="pi pi-arrow-left" label="Vissza" severity="secondary" outlined @click="router.push('/users')" />
                        <Button 
                            :icon="user.is_active ? 'pi pi-lock' : 'pi pi-lock-open'"
                            :label="user.is_active ? 'Deaktiválás' : 'Aktiválás'"
                            :severity="user.is_active ? 'warning' : 'success'"
                            @click="toggleActive"
                        />
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="col-12 lg:col-6">
                    <div class="card">
                        <h5 class="mb-4">Felhasználó adatai</h5>
                        <div class="flex flex-column gap-4">
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Email</span>
                                <span class="font-medium">{{ user.email }}</span>
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Teljes név</span>
                                <span class="font-medium">{{ user.full_name || '-' }}</span>
                            </div>
                            <div class="flex justify-content-between align-items-center">
                                <span class="text-color-secondary">Jogosultság</span>
                                <Select 
                                    :modelValue="user.role" 
                                    :options="roles"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-10rem"
                                    @update:modelValue="changeRole"
                                />
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Regisztráció</span>
                                <span class="font-medium">{{ formatDate(user.created_at) }}</span>
                            </div>
                            <div class="flex justify-content-between">
                                <span class="text-color-secondary">Utolsó bejelentkezés</span>
                                <span class="font-medium">{{ formatDate(user.last_login) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 lg:col-6">
                    <div class="card">
                        <h5 class="mb-4">Legutóbbi tevékenységek</h5>
                        <div v-if="userActivity.length === 0" class="text-center py-4 text-color-secondary">
                            Nincs tevékenység
                        </div>
                        <div v-else class="flex flex-column gap-3">
                            <div v-for="activity in userActivity" :key="activity.id" class="flex align-items-center gap-3 p-2 surface-100 border-round">
                                <i class="pi pi-clock text-color-secondary"></i>
                                <div class="flex-1">
                                    <div class="font-medium">{{ activity.description }}</div>
                                    <div class="text-sm text-color-secondary">{{ formatDate(activity.created_at) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
