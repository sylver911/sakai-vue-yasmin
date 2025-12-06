<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useLayout } from '@/layout/composables/layout';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isDarkTheme, toggleDarkMode } = useLayout();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
    if (!email.value || !password.value) {
        error.value = 'Kérjük, töltse ki az összes mezőt';
        return;
    }

    loading.value = true;
    error.value = '';

    const success = await authStore.login(email.value, password.value);

    if (success) {
        const redirect = route.query.redirect || '/';
        router.push(redirect);
    } else {
        error.value = authStore.error || 'Hibás email vagy jelszó';
    }

    loading.value = false;
};
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 min-h-screen flex items-center justify-center">
        <div class="flex flex-column align-items-center justify-content-center min-h-screen">
            <div class="w-full surface-card py-8 px-6 sm:px-8 shadow-2 border-round-xl" style="max-width: 400px">
                <!-- Logo -->
                <div class="text-center mb-5">
                    <div class="flex align-items-center justify-content-center gap-2 mb-4">
                        <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-3rem">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467Z"
                                fill="var(--primary-color)"
                            />
                        </svg>
                        <span class="text-2xl font-bold text-900">OrderSystem</span>
                    </div>
                    <h1 class="text-900 text-xl font-semibold m-0">Bejelentkezés</h1>
                    <p class="text-color-secondary mt-2 mb-0">Üdvözöljük! Jelentkezzen be a folytatáshoz.</p>
                </div>

                <!-- Error Message -->
                <Message v-if="error" severity="error" :closable="false" class="mb-4">
                    {{ error }}
                </Message>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin">
                    <div class="mb-4">
                        <label for="email" class="block text-900 font-medium mb-2">Email cím</label>
                        <InputText 
                            id="email" 
                            v-model="email" 
                            type="email"
                            placeholder="pelda@email.com"
                            class="w-full" 
                            :class="{ 'p-invalid': error }"
                        />
                    </div>

                    <div class="mb-4">
                        <label for="password" class="block text-900 font-medium mb-2">Jelszó</label>
                        <Password 
                            id="password" 
                            v-model="password" 
                            placeholder="Jelszó"
                            class="w-full"
                            inputClass="w-full"
                            :feedback="false"
                            toggleMask
                            :class="{ 'p-invalid': error }"
                        />
                    </div>

                    <div class="flex align-items-center justify-content-between mb-5">
                        <div class="flex align-items-center">
                            <Checkbox 
                                id="rememberme" 
                                :binary="true" 
                                class="mr-2"
                            />
                            <label for="rememberme" class="text-color-secondary cursor-pointer">
                                Emlékezz rám
                            </label>
                        </div>
                        <a class="font-medium text-primary no-underline cursor-pointer hover:underline">
                            Elfelejtett jelszó?
                        </a>
                    </div>

                    <Button 
                        type="submit"
                        label="Bejelentkezés" 
                        icon="pi pi-sign-in"
                        class="w-full"
                        :loading="loading"
                    />
                </form>

                <!-- Dark Mode Toggle -->
                <div class="flex justify-content-center mt-5">
                    <Button 
                        :icon="isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'"
                        text
                        rounded
                        @click="toggleDarkMode"
                        v-tooltip="isDarkTheme ? 'Világos mód' : 'Sötét mód'"
                    />
                </div>
            </div>

            <!-- Footer -->
            <p class="text-color-secondary text-sm mt-5">
                © {{ new Date().getFullYear() }} OrderSystem. Minden jog fenntartva.
            </p>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-password-input) {
    width: 100%;
}
</style>
