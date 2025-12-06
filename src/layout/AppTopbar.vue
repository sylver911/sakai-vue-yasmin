<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import AppConfigurator from './AppConfigurator.vue';

const router = useRouter();
const authStore = useAuthStore();
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const userMenuRef = ref();
const notificationsRef = ref();

const userMenuItems = computed(() => [
    {
        label: authStore.fullName || 'Felhasználó',
        items: [
            {
                label: 'Profil',
                icon: 'pi pi-user',
                command: () => router.push('/profile')
            },
            {
                label: 'Beállítások',
                icon: 'pi pi-cog',
                command: () => router.push('/settings'),
                visible: authStore.isAdmin
            },
            {
                separator: true
            },
            {
                label: 'Kijelentkezés',
                icon: 'pi pi-sign-out',
                command: () => handleLogout()
            }
        ]
    }
]);

const handleLogout = async () => {
    await authStore.logout();
    router.push('/auth/login');
};

const toggleUserMenu = (event) => {
    userMenuRef.value.toggle(event);
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467Z"
                        fill="var(--primary-color)"
                    />
                </svg>
                <span>OrderSystem</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <!-- Dark Mode Toggle -->
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode" v-tooltip.bottom="isDarkTheme ? 'Világos mód' : 'Sötét mód'">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                
                <!-- Theme Configurator -->
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                        v-tooltip.bottom="'Téma beállítások'"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <!-- Quick Actions -->
            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <!-- Calendar -->
                    <button type="button" class="layout-topbar-action" @click="router.push('/calendar')" v-tooltip.bottom="'Naptár'">
                        <i class="pi pi-calendar"></i>
                        <span>Naptár</span>
                    </button>
                    
                    <!-- Quick Add Order -->
                    <button type="button" class="layout-topbar-action" @click="router.push('/orders/new')" v-tooltip.bottom="'Új megrendelés'">
                        <i class="pi pi-plus"></i>
                        <span>Új megrendelés</span>
                    </button>
                    
                    <!-- User Menu -->
                    <button type="button" class="layout-topbar-action" @click="toggleUserMenu">
                        <Avatar 
                            v-if="authStore.user?.avatar"
                            :image="authStore.user.avatar" 
                            shape="circle"
                            class="w-2rem h-2rem"
                        />
                        <Avatar 
                            v-else
                            :label="authStore.fullName?.charAt(0) || 'U'" 
                            shape="circle"
                            class="w-2rem h-2rem bg-primary text-white"
                        />
                    </button>
                    <Menu ref="userMenuRef" :model="userMenuItems" :popup="true" />
                </div>
            </div>
        </div>
    </div>
</template>
