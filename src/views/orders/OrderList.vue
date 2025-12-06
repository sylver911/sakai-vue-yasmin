<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { ordersApi } from '@/api/orders';
import { customersApi } from '@/api/customers';
import { settingsApi } from '@/api/settings';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const orders = ref([]);
const loading = ref(true);
const totalRecords = ref(0);
const selectedOrders = ref([]);

const customers = ref([]);
const statuses = ref([]);

const filters = ref({
    search: '',
    status: null,
    customer: null,
    is_overdue: null,
    deadline_from: null,
    deadline_to: null
});

const lazyParams = ref({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'created_at',
    sortOrder: -1
});

const loadData = async () => {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            query: filters.value.search || undefined,
            status: filters.value.status || undefined,
            customer: filters.value.customer || undefined,
            is_overdue: filters.value.is_overdue ?? undefined,
            deadline_from: filters.value.deadline_from 
                ? filters.value.deadline_from.toISOString().split('T')[0] 
                : undefined,
            deadline_to: filters.value.deadline_to 
                ? filters.value.deadline_to.toISOString().split('T')[0] 
                : undefined,
            ordering: lazyParams.value.sortOrder === 1 
                ? lazyParams.value.sortField 
                : `-${lazyParams.value.sortField}`
        };

        const response = await ordersApi.list(params);
        orders.value = response.results;
        totalRecords.value = response.count;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Hiba',
            detail: 'Nem sikerült betölteni a megrendeléseket',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const loadFiltersData = async () => {
    try {
        const [customersData, statusesData] = await Promise.all([
            customersApi.dropdown(),
            settingsApi.statuses.list({ is_active: true })
        ]);
        customers.value = customersData || [];
        statuses.value = statusesData.results || [];
    } catch (error) {
        console.error('Failed to load filter data:', error);
    }
};

const onPage = (event) => {
    lazyParams.value.first = event.first;
    lazyParams.value.rows = event.rows;
    lazyParams.value.page = event.page + 1;
    loadData();
};

const onSort = (event) => {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    loadData();
};

const clearFilters = () => {
    filters.value = {
        search: '',
        status: null,
        customer: null,
        is_overdue: null,
        deadline_from: null,
        deadline_to: null
    };
    loadData();
};

const confirmDelete = (order) => {
    confirm.require({
        message: `Biztosan törölni szeretné a "${order.reference_number}" megrendelést?`,
        header: 'Törlés megerősítése',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Törlés',
        rejectLabel: 'Mégse',
        accept: async () => {
            try {
                await ordersApi.delete(order.id);
                toast.add({
                    severity: 'success',
                    summary: 'Sikeres',
                    detail: 'Megrendelés törölve',
                    life: 3000
                });
                loadData();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Hiba',
                    detail: 'Nem sikerült törölni a megrendelést',
                    life: 3000
                });
            }
        }
    });
};

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

let searchTimeout = null;
watch(() => filters.value.search, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        lazyParams.value.page = 1;
        loadData();
    }, 500);
});

onMounted(() => {
    loadFiltersData();
    loadData();
});
</script>

            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-column gap-3 mb-4">
            <div class="flex flex-column md:flex-row gap-3">
                <IconField iconPosition="left" class="flex-1">
                    <InputIcon class="pi pi-search" />
                    <InputText 
                        v-model="filters.search" 
                        placeholder="Keresés azonosító, név, ügyfél alapján..." 
                        class="w-full"
                    />
                </IconField>
                <Select 
                    v-model="filters.status" 
                    :options="statuses" 
                    optionLabel="name" 
                    optionValue="id"
                    placeholder="Státusz" 
                    class="w-full md:w-12rem"
                    showClear
                    @change="loadData"
                >
                    <template #option="{ option }">
                        <div class="flex align-items-center gap-2">
                            <span 
                                class="w-1rem h-1rem border-round" 
                                :style="{ backgroundColor: option.color }"
                            ></span>
                            {{ option.name }}
                        </div>
                    </template>
                </Select>
                <Select 
                    v-model="filters.customer" 
                    :options="customers" 
                    optionLabel="display_name" 
                    optionValue="id"
                    placeholder="Ügyfél" 
                    class="w-full md:w-14rem"
                    showClear
                    filter
                    @change="loadData"
                />
            </div>
            <div class="flex flex-column md:flex-row gap-3 align-items-center">
                <div class="flex align-items-center gap-2">
                    <label class="text-color-secondary">Határidő:</label>
                    <DatePicker 
                        v-model="filters.deadline_from" 
                        placeholder="Kezdő dátum"
                        dateFormat="yy.mm.dd"
                        showIcon
                        class="w-10rem"
                        @date-select="loadData"
                    />
                    <span class="text-color-secondary">-</span>
                    <DatePicker 
                        v-model="filters.deadline_to" 
                        placeholder="Záró dátum"
                        dateFormat="yy.mm.dd"
                        showIcon
                        class="w-10rem"
                        @date-select="loadData"
                    />
                </div>
                <div class="flex align-items-center gap-2">
                    <Checkbox 
                        v-model="filters.is_overdue" 
                        :binary="true"
                        inputId="overdue"
                        @change="loadData"
                    />
                    <label for="overdue" class="text-color-secondary cursor-pointer">
                        Csak késedelmesek
                    </label>
                </div>
                <Button 
                    icon="pi pi-filter-slash" 
                    severity="secondary" 
                    outlined
                    v-tooltip="'Szűrők törlése'"
                    @click="clearFilters"
                />
            </div>
        </div>

        <!-- Data Table -->
        <DataTable 
            v-model:selection="selectedOrders"
            :value="orders" 
            :loading="loading"
            :lazy="true"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[10, 25, 50]"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            dataKey="id"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} - {last} / {totalRecords} megrendelés"
            @page="onPage"
            @sort="onSort"
        >
            <template #empty>
                <div class="text-center py-5">
                    <i class="pi pi-shopping-cart text-4xl text-color-secondary mb-3"></i>
                    <p class="m-0 text-color-secondary">Nincs találat</p>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            
            <Column field="reference_number" header="Azonosító" sortable style="width: 10rem">
                <template #body="{ data }">
                    <router-link 
                        :to="`/orders/${data.id}`" 
                        class="font-medium text-primary hover:underline"
                    >
                        {{ data.reference_number }}
                    </router-link>
                </template>
            </Column>

            <Column field="name" header="Megnevezés" sortable style="min-width: 14rem">
                <template #body="{ data }">
                    <div>
                        <div class="font-medium">{{ data.name }}</div>
                        <div class="text-sm text-color-secondary">
                            {{ data.item_count }} tétel
                        </div>
                    </div>
                </template>
            </Column>

            <Column field="customer_name" header="Ügyfél" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <router-link 
                        :to="`/customers/${data.customer}`" 
                        class="text-primary hover:underline"
                    >
                        {{ data.customer_name }}
                    </router-link>
                </template>
            </Column>

            <Column field="status_name" header="Státusz" sortable style="width: 10rem">
                <template #body="{ data }">
                    <Tag 
                        :value="data.status_name"
                        :style="{ backgroundColor: data.status_color, color: '#fff' }"
                    />
                </template>
            </Column>

            <Column field="total" header="Összeg" sortable style="width: 10rem">
                <template #body="{ data }">
                    <span class="font-medium">{{ formatCurrency(data.total) }}</span>
                </template>
            </Column>

            <Column field="order_date" header="Dátum" sortable style="width: 9rem">
                <template #body="{ data }">
                    {{ formatDate(data.order_date) }}
                </template>
            </Column>

            <Column field="deadline" header="Határidő" sortable style="width: 9rem">
                <template #body="{ data }">
                    <div :class="{ 'text-red-500 font-medium': data.is_overdue }">
                        {{ formatDate(data.deadline) }}
                        <i v-if="data.is_overdue" class="pi pi-exclamation-circle ml-1"></i>
                    </div>
                </template>
            </Column>

            <Column header="Műveletek" style="width: 8rem" frozen alignFrozen="right">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button 
                            icon="pi pi-eye" 
                            rounded 
                            text 
                            severity="info"
                            v-tooltip="'Megtekintés'"
                            @click="router.push(`/orders/${data.id}`)"
                        />
                        <Button 
                            icon="pi pi-pencil" 
                            rounded 
                            text 
                            severity="secondary"
                            v-tooltip="'Szerkesztés'"
                            @click="router.push(`/orders/${data.id}/edit`)"
                        />
                        <Button 
                            icon="pi pi-trash" 
                            rounded 
                            text 
                            severity="danger"
                            v-tooltip="'Törlés'"
                            @click="confirmDelete(data)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
