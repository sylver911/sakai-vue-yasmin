<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { ordersApi } from '@/api/orders';

const router = useRouter();
const toast = useToast();

const loading = ref(true);
const calendarEvents = ref([]);
const selectedDate = ref(new Date());
const viewMode = ref('month'); // month, week, day

const eventTypes = [
    { label: 'Határidő', value: 'deadline', color: '#EF4444' },
    { label: 'Mérföldkő', value: 'milestone', color: '#3B82F6' },
    { label: 'Megrendelés', value: 'order', color: '#22C55E' }
];

const loadCalendarData = async () => {
    loading.value = true;
    try {
        const response = await ordersApi.calendar();
        calendarEvents.value = response || [];
    } catch (error) {
        console.error('Failed to load calendar:', error);
        toast.add({
            severity: 'error',
            summary: 'Hiba',
            detail: 'Nem sikerült betölteni a naptár adatokat',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const eventsForDate = computed(() => {
    const dateStr = selectedDate.value.toISOString().split('T')[0];
    return calendarEvents.value.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === dateStr;
    });
});

const getEventColor = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || '#6B7280';
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
};

const navigateToOrder = (orderId) => {
    router.push(`/orders/${orderId}`);
};

const hasEventsOnDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.value.some(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === dateStr;
    });
};

onMounted(() => {
    loadCalendarData();
});
</script>

<template>
    <div class="grid">
        <Toast />
        
        <!-- Calendar -->
        <div class="col-12 lg:col-8">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h2 class="m-0 text-2xl font-semibold">Naptár</h2>
                    <div class="flex gap-2">
                        <SelectButton 
                            v-model="viewMode" 
                            :options="[
                                { label: 'Hónap', value: 'month' },
                                { label: 'Hét', value: 'week' }
                            ]"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                </div>

                <DatePicker
                    v-model="selectedDate"
                    inline
                    :showWeek="true"
                    class="w-full custom-calendar"
                    @date-select="(date) => selectedDate = date"
                >
                    <template #date="{ date }">
                        <div class="relative">
                            {{ date.day }}
                            <span 
                                v-if="hasEventsOnDate(new Date(date.year, date.month, date.day))"
                                class="absolute bottom-0 left-50 w-1 h-1 bg-primary border-round-full"
                                style="transform: translateX(-50%)"
                            ></span>
                        </div>
                    </template>
                </DatePicker>
            </div>
        </div>

        <!-- Events Sidebar -->
        <div class="col-12 lg:col-4">
            <div class="card">
                <h5 class="m-0 mb-4">{{ formatDate(selectedDate) }}</h5>
                
                <div v-if="loading" class="flex justify-content-center py-5">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                </div>

                <div v-else-if="eventsForDate.length === 0" class="text-center py-5">
                    <i class="pi pi-calendar text-4xl text-color-secondary mb-3"></i>
                    <p class="m-0 text-color-secondary">Nincs esemény ezen a napon</p>
                </div>

                <div v-else class="flex flex-column gap-3">
                    <div 
                        v-for="event in eventsForDate" 
                        :key="event.id"
                        class="p-3 border-round-lg cursor-pointer hover:surface-100 transition-colors transition-duration-200"
                        :style="{ borderLeft: `4px solid ${getEventColor(event.type)}` }"
                        @click="navigateToOrder(event.order_id)"
                    >
                        <div class="flex align-items-center justify-content-between mb-2">
                            <Tag 
                                :value="eventTypes.find(t => t.value === event.type)?.label"
                                :style="{ backgroundColor: getEventColor(event.type) }"
                            />
                            <span class="text-sm text-color-secondary">
                                {{ event.order_reference }}
                            </span>
                        </div>
                        <div class="font-medium text-900 mb-1">{{ event.title }}</div>
                        <div class="text-sm text-color-secondary">{{ event.description }}</div>
                    </div>
                </div>

                <!-- Legend -->
                <Divider />
                <div class="flex flex-wrap gap-3">
                    <div 
                        v-for="type in eventTypes" 
                        :key="type.value"
                        class="flex align-items-center gap-2"
                    >
                        <span 
                            class="w-1rem h-1rem border-round"
                            :style="{ backgroundColor: type.color }"
                        ></span>
                        <span class="text-sm text-color-secondary">{{ type.label }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-calendar :deep(.p-datepicker) {
    border: none;
    width: 100%;
}

.custom-calendar :deep(.p-datepicker-header) {
    padding: 1rem;
}

.custom-calendar :deep(.p-datepicker table) {
    font-size: 1rem;
}

.custom-calendar :deep(.p-datepicker table td) {
    padding: 0.5rem;
}

.custom-calendar :deep(.p-datepicker table td > span) {
    width: 3rem;
    height: 3rem;
}
</style>
