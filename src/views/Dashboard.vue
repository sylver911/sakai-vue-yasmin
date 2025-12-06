<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ordersApi } from '@/api/orders';
import { customersApi } from '@/api/customers';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const stats = ref({
    totalOrders: 0,
    activeOrders: 0,
    overdueOrders: 0,
    totalCustomers: 0,
    thisMonthOrders: 0,
    thisMonthRevenue: 0
});
const recentOrders = ref([]);
const upcomingMilestones = ref([]);

const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Jó reggelt';
    if (hour < 18) return 'Jó napot';
    return 'Jó estét';
});

onMounted(async () => {
    try {
        const [orderStats, customerStats, orders, milestones] = await Promise.all([
            ordersApi.statistics(),
            customersApi.statistics(),
            ordersApi.list({ page: 1, ordering: '-created_at' }),
            ordersApi.milestones.upcoming()
        ]);

        stats.value = {
            totalOrders: orderStats.total_orders || 0,
            activeOrders: orderStats.active_orders || 0,
            overdueOrders: orderStats.overdue_orders || 0,
            totalCustomers: customerStats.total_customers || 0,
            thisMonthOrders: orderStats.this_month_orders || 0,
            thisMonthRevenue: orderStats.this_month_revenue || 0
        };
        recentOrders.value = orders.results?.slice(0, 5) || [];
        upcomingMilestones.value = milestones?.slice(0, 5) || [];
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    } finally {
        loading.value = false;
    }
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0
    }).format(value || 0);
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('hu-HU');
};

const getStatusSeverity = (order) => {
    if (order.is_overdue) return 'danger';
    return 'info';
};

const navigateToOrder = (id) => {
    router.push(`/orders/${id}`);
};
</script>

<template>
    <div class="grid">
        <!-- Welcome Card -->
        <div class="col-12">
            <div class="card mb-0">
                <div class="flex align-items-center justify-content-between">
                    <div>
                        <h2 class="text-2xl font-semibold m-0">
                            {{ greeting }}, {{ authStore.fullName }}! 👋
                        </h2>
                        <p class="text-color-secondary mt-2 mb-0">
                            Itt van a mai nap áttekintése
                        </p>
                    </div>
                    <Button 
                        label="Új megrendelés" 
                        icon="pi pi-plus" 
                        @click="router.push('/orders/new')"
                    />
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="col-12 md:col-6 lg:col-3">
            <div class="card h-full">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-color-secondary font-medium">Összes megrendelés</span>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round w-3rem h-3rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-900">{{ stats.totalOrders }}</div>
                <span class="text-color-secondary text-sm">ebből aktív: {{ stats.activeOrders }}</span>
            </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <div class="card h-full">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-color-secondary font-medium">Ügyfélszám</span>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round w-3rem h-3rem">
                        <i class="pi pi-users text-green-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-900">{{ stats.totalCustomers }}</div>
                <span class="text-color-secondary text-sm">regisztrált ügyfél</span>
            </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <div class="card h-full">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-color-secondary font-medium">Késedelmes</span>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round w-3rem h-3rem">
                        <i class="pi pi-exclamation-triangle text-orange-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold" :class="stats.overdueOrders > 0 ? 'text-orange-500' : 'text-900'">
                    {{ stats.overdueOrders }}
                </div>
                <span class="text-color-secondary text-sm">megrendelés határidőn túl</span>
            </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <div class="card h-full">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-color-secondary font-medium">Havi bevétel</span>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round w-3rem h-3rem">
                        <i class="pi pi-wallet text-purple-500 text-xl"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-900">{{ formatCurrency(stats.thisMonthRevenue) }}</div>
                <span class="text-color-secondary text-sm">{{ stats.thisMonthOrders }} megrendelésből</span>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Legutóbbi megrendelések</h5>
                    <Button 
                        label="Összes" 
                        icon="pi pi-arrow-right" 
                        iconPos="right"
                        text 
                        @click="router.push('/orders')"
                    />
                </div>
                <DataTable 
                    :value="recentOrders" 
                    :loading="loading"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                >
                    <Column field="reference_number" header="Azonosító" style="width: 15%">
                        <template #body="{ data }">
                            <span 
                                class="font-medium cursor-pointer text-primary hover:underline"
                                @click="navigateToOrder(data.id)"
                            >
                                {{ data.reference_number }}
                            </span>
                        </template>
                    </Column>
                    <Column field="name" header="Megrendelés" style="width: 30%"></Column>
                    <Column field="customer_name" header="Ügyfél" style="width: 25%"></Column>
                    <Column field="status_name" header="Státusz" style="width: 15%">
                        <template #body="{ data }">
                            <Tag 
                                :value="data.status_name" 
                                :severity="getStatusSeverity(data)"
                                :style="{ backgroundColor: data.status_color }"
                            />
                        </template>
                    </Column>
                    <Column field="deadline" header="Határidő" style="width: 15%">
                        <template #body="{ data }">
                            <span :class="{ 'text-red-500 font-medium': data.is_overdue }">
                                {{ formatDate(data.deadline) }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Upcoming Milestones -->
        <div class="col-12 lg:col-4">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5 class="m-0">Közelgő mérföldkövek</h5>
                    <Button 
                        label="Naptár" 
                        icon="pi pi-calendar" 
                        text 
                        @click="router.push('/calendar')"
                    />
                </div>
                <div v-if="upcomingMilestones.length === 0" class="text-center text-color-secondary py-4">
                    <i class="pi pi-check-circle text-4xl mb-3 text-green-500"></i>
                    <p class="m-0">Nincs közelgő mérföldkő</p>
                </div>
                <Timeline 
                    v-else
                    :value="upcomingMilestones" 
                    class="customized-timeline"
                >
                    <template #marker="{ item }">
                        <span 
                            class="flex w-2rem h-2rem align-items-center justify-content-center border-circle z-1 shadow-1"
                            :style="{ backgroundColor: item.color || '#3B82F6' }"
                        >
                            <i :class="item.is_completed ? 'pi pi-check' : 'pi pi-flag'" class="text-white text-sm"></i>
                        </span>
                    </template>
                    <template #content="{ item }">
                        <div class="mb-3">
                            <span class="font-medium">{{ item.name }}</span>
                            <p class="text-color-secondary text-sm mt-1 mb-0">
                                {{ formatDate(item.due_date) }}
                                <span v-if="item.is_overdue" class="text-red-500 ml-2">
                                    <i class="pi pi-exclamation-circle"></i> Késedelmes
                                </span>
                            </p>
                        </div>
                    </template>
                </Timeline>
            </div>
        </div>
    </div>
</template>

<style scoped>
.customized-timeline :deep(.p-timeline-event-opposite) {
    display: none;
}
</style>
