<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div class="w-full surface-card py-8 px-6 sm:px-8 shadow-2 border-round-xl text-center" style="max-width: 400px">
                <span class="text-8xl font-bold text-primary mb-4 block">404</span>
                <h1 class="text-900 text-3xl font-bold mb-3">Oldal nem található</h1>
                <p class="text-color-secondary mb-5">
                    A keresett oldal nem létezik vagy áthelyezésre került.
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
