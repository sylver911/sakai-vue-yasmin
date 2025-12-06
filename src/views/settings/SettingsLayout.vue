<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const menuItems = [
    { label: 'Áttekintés', icon: 'pi pi-home', to: '/settings' },
    { label: 'Státuszok', icon: 'pi pi-tag', to: '/settings/statuses' },
    { label: 'Egyedi mezők', icon: 'pi pi-sliders-h', to: '/settings/custom-fields' },
    { label: 'Mérföldkő sablonok', icon: 'pi pi-flag', to: '/settings/milestones' },
    { label: 'Csatolmány típusok', icon: 'pi pi-paperclip', to: '/settings/attachment-types' }
];
</script>

<template>
    <div class="grid">
        <!-- Sidebar -->
        <div class="col-12 md:col-3">
            <div class="card">
                <h5 class="mb-3">Beállítások</h5>
                <ul class="list-none p-0 m-0">
                    <li v-for="item in menuItems" :key="item.to">
                        <router-link 
                            :to="item.to"
                            class="flex align-items-center gap-2 p-3 border-round cursor-pointer no-underline"
                            :class="route.path === item.to ? 'bg-primary text-white' : 'text-color hover:surface-100'"
                        >
                            <i :class="item.icon"></i>
                            <span>{{ item.label }}</span>
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Content -->
        <div class="col-12 md:col-9">
            <router-view />
        </div>
    </div>
</template>
