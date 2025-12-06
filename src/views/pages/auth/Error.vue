<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div class="w-full surface-card py-8 px-6 sm:px-8 shadow-2 border-round-xl text-center" style="max-width: 400px">
                <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-4"></i>
                <h1 class="text-900 text-3xl font-bold mb-3">Hiba történt</h1>
                <p class="text-color-secondary mb-5">
                    Váratlan hiba történt. Kérjük, próbálja újra később.
                </p>
                <Button 
                    label="Vissza a főoldalra" 
                    icon="pi pi-home"
                    @click="router.push('/')"
                />
            </div>
        </div>
    </div>
</template>
