<script setup>
import { ref, onMounted } from 'vue';
import { settingsApi } from '@/api/settings';

const stats = ref({
    statuses: 0,
    customFields: 0,
    milestoneTemplates: 0,
    attachmentTypes: 0
});

const loadStats = async () => {
    try {
        const [statusRes, fieldsRes, milestonesRes, attachRes] = await Promise.all([
            settingsApi.statuses.list(),
            settingsApi.customFields.list(),
            settingsApi.milestoneTemplates.list(),
            settingsApi.attachmentTypes.list()
        ]);
        stats.value = {
            statuses: statusRes.count || statusRes.results?.length || 0,
            customFields: fieldsRes.count || fieldsRes.results?.length || 0,
            milestoneTemplates: milestonesRes.count || milestonesRes.results?.length || 0,
            attachmentTypes: attachRes.count || attachRes.results?.length || 0
        };
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
};

onMounted(() => {
    loadStats();
});
</script>

<template>
    <div class="card">
        <h2 class="m-0 mb-4 text-2xl font-semibold">Beállítások áttekintése</h2>
        
        <div class="grid">
            <div class="col-12 md:col-6 lg:col-3">
                <router-link to="/settings/statuses" class="no-underline">
                    <div class="surface-100 border-round p-4 hover:surface-200 cursor-pointer transition-colors">
                        <div class="flex align-items-center gap-3">
                            <div class="w-3rem h-3rem flex align-items-center justify-content-center border-round bg-blue-100">
                                <i class="pi pi-tag text-blue-500 text-xl"></i>
                            </div>
                            <div>
                                <div class="text-color-secondary text-sm">Státuszok</div>
                                <div class="text-2xl font-bold">{{ stats.statuses }}</div>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
                <router-link to="/settings/custom-fields" class="no-underline">
                    <div class="surface-100 border-round p-4 hover:surface-200 cursor-pointer transition-colors">
                        <div class="flex align-items-center gap-3">
                            <div class="w-3rem h-3rem flex align-items-center justify-content-center border-round bg-green-100">
                                <i class="pi pi-sliders-h text-green-500 text-xl"></i>
                            </div>
                            <div>
                                <div class="text-color-secondary text-sm">Egyedi mezők</div>
                                <div class="text-2xl font-bold">{{ stats.customFields }}</div>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
                <router-link to="/settings/milestones" class="no-underline">
                    <div class="surface-100 border-round p-4 hover:surface-200 cursor-pointer transition-colors">
                        <div class="flex align-items-center gap-3">
                            <div class="w-3rem h-3rem flex align-items-center justify-content-center border-round bg-orange-100">
                                <i class="pi pi-flag text-orange-500 text-xl"></i>
                            </div>
                            <div>
                                <div class="text-color-secondary text-sm">Mérföldkő sablonok</div>
                                <div class="text-2xl font-bold">{{ stats.milestoneTemplates }}</div>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
            <div class="col-12 md:col-6 lg:col-3">
                <router-link to="/settings/attachment-types" class="no-underline">
                    <div class="surface-100 border-round p-4 hover:surface-200 cursor-pointer transition-colors">
                        <div class="flex align-items-center gap-3">
                            <div class="w-3rem h-3rem flex align-items-center justify-content-center border-round bg-purple-100">
                                <i class="pi pi-paperclip text-purple-500 text-xl"></i>
                            </div>
                            <div>
                                <div class="text-color-secondary text-sm">Csatolmány típusok</div>
                                <div class="text-2xl font-bold">{{ stats.attachmentTypes }}</div>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>
