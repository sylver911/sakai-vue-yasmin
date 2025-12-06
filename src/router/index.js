import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { title: 'Vezérlőpult' }
                },
                // Customers
                {
                    path: '/customers',
                    name: 'customers',
                    component: () => import('@/views/customers/CustomerList.vue'),
                    meta: { title: 'Ügyfelek' }
                },
                {
                    path: '/customers/new',
                    name: 'customer-new',
                    component: () => import('@/views/customers/CustomerForm.vue'),
                    meta: { title: 'Új ügyfél' }
                },
                {
                    path: '/customers/:id',
                    name: 'customer-detail',
                    component: () => import('@/views/customers/CustomerDetail.vue'),
                    meta: { title: 'Ügyfél részletek' }
                },
                {
                    path: '/customers/:id/edit',
                    name: 'customer-edit',
                    component: () => import('@/views/customers/CustomerForm.vue'),
                    meta: { title: 'Ügyfél szerkesztése' }
                },
                // Orders
                {
                    path: '/orders',
                    name: 'orders',
                    component: () => import('@/views/orders/OrderList.vue'),
                    meta: { title: 'Megrendelések' }
                },
                {
                    path: '/orders/new',
                    name: 'order-new',
                    component: () => import('@/views/orders/OrderForm.vue'),
                    meta: { title: 'Új megrendelés' }
                },
                {
                    path: '/orders/:id',
                    name: 'order-detail',
                    component: () => import('@/views/orders/OrderDetail.vue'),
                    meta: { title: 'Megrendelés részletek' }
                },
                {
                    path: '/orders/:id/edit',
                    name: 'order-edit',
                    component: () => import('@/views/orders/OrderForm.vue'),
                    meta: { title: 'Megrendelés szerkesztése' }
                },
                // Calendar
                {
                    path: '/calendar',
                    name: 'calendar',
                    component: () => import('@/views/calendar/Calendar.vue'),
                    meta: { title: 'Naptár' }
                },
                // Users
                {
                    path: '/users',
                    name: 'users',
                    component: () => import('@/views/users/UserList.vue'),
                    meta: { title: 'Felhasználók', requiresAdmin: true }
                },
                {
                    path: '/users/:id',
                    name: 'user-detail',
                    component: () => import('@/views/users/UserDetail.vue'),
                    meta: { title: 'Felhasználó részletek', requiresAdmin: true }
                },
                // Settings
                {
                    path: '/settings',
                    name: 'settings',
                    component: () => import('@/views/settings/SettingsLayout.vue'),
                    meta: { title: 'Beállítások', requiresAdmin: true },
                    children: [
                        {
                            path: '',
                            name: 'settings-overview',
                            component: () => import('@/views/settings/SettingsOverview.vue')
                        },
                        {
                            path: 'statuses',
                            name: 'settings-statuses',
                            component: () => import('@/views/settings/StatusSettings.vue'),
                            meta: { title: 'Státuszok' }
                        },
                        {
                            path: 'custom-fields',
                            name: 'settings-custom-fields',
                            component: () => import('@/views/settings/CustomFieldSettings.vue'),
                            meta: { title: 'Egyedi mezők' }
                        },
                        {
                            path: 'milestones',
                            name: 'settings-milestones',
                            component: () => import('@/views/settings/MilestoneTemplateSettings.vue'),
                            meta: { title: 'Mérföldkő sablonok' }
                        },
                        {
                            path: 'attachment-types',
                            name: 'settings-attachment-types',
                            component: () => import('@/views/settings/AttachmentTypeSettings.vue'),
                            meta: { title: 'Csatolmány típusok' }
                        }
                    ]
                },
                // Profile
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/users/Profile.vue'),
                    meta: { title: 'Profil' }
                },
                // Activity Logs
                {
                    path: '/activity-logs',
                    name: 'activity-logs',
                    component: () => import('@/views/users/ActivityLogs.vue'),
                    meta: { title: 'Tevékenység napló', requiresAdmin: true }
                }
            ]
        },
        // Auth pages (no layout)
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { title: 'Bejelentkezés', guest: true }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
            meta: { title: 'Hozzáférés megtagadva' }
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
            meta: { title: 'Hiba' }
        },
        // 404
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: { title: 'Oldal nem található' }
        }
    ]
});

// Navigation guards
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Update page title
    document.title = to.meta.title ? `${to.meta.title} | OrderSystem` : 'OrderSystem';

    // Guest only routes (login)
    if (to.meta.guest && token) {
        return next({ name: 'dashboard' });
    }

    // Protected routes
    if (to.meta.requiresAuth && !token) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Admin only routes
    if (to.meta.requiresAdmin && user && !user.is_admin) {
        return next({ name: 'accessDenied' });
    }

    next();
});

export default router;
