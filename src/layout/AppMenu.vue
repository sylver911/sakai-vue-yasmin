<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

const model = computed(() => {
    const items = [
        {
            label: 'Főmenü',
            items: [
                { 
                    label: 'Vezérlőpult', 
                    icon: 'pi pi-fw pi-home', 
                    to: '/' 
                },
                { 
                    label: 'Naptár', 
                    icon: 'pi pi-fw pi-calendar', 
                    to: '/calendar' 
                }
            ]
        },
        {
            label: 'Munkaterület',
            items: [
                { 
                    label: 'Megrendelések', 
                    icon: 'pi pi-fw pi-shopping-cart', 
                    to: '/orders' 
                },
                { 
                    label: 'Ügyfelek', 
                    icon: 'pi pi-fw pi-users', 
                    to: '/customers' 
                }
            ]
        }
    ];

    // Admin only menu items
    if (authStore.isAdmin) {
        items.push({
            label: 'Adminisztráció',
            items: [
                { 
                    label: 'Felhasználók', 
                    icon: 'pi pi-fw pi-user-edit', 
                    to: '/users' 
                },
                { 
                    label: 'Tevékenység napló', 
                    icon: 'pi pi-fw pi-history', 
                    to: '/activity-logs' 
                },
                { 
                    label: 'Beállítások', 
                    icon: 'pi pi-fw pi-cog', 
                    items: [
                        { 
                            label: 'Státuszok', 
                            icon: 'pi pi-fw pi-circle', 
                            to: '/settings/statuses' 
                        },
                        { 
                            label: 'Egyedi mezők', 
                            icon: 'pi pi-fw pi-sliders-h', 
                            to: '/settings/custom-fields' 
                        },
                        { 
                            label: 'Mérföldkő sablonok', 
                            icon: 'pi pi-fw pi-flag', 
                            to: '/settings/milestones' 
                        },
                        { 
                            label: 'Csatolmány típusok', 
                            icon: 'pi pi-fw pi-paperclip', 
                            to: '/settings/attachment-types' 
                        }
                    ]
                }
            ]
        });
    }

    return items;
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
