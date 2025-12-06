<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { customersApi } from '@/api/customers';
import { settingsApi } from '@/api/settings';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const customerId = computed(() => route.params.id);
const isEdit = computed(() => !!customerId.value);

const customer = ref({
    customer_type: 'individual',
    first_name: '',
    last_name: '',
    company_name: '',
    tax_number: '',
    registration_number: '',
    identifier: '',
    notes: '',
    is_active: true,
    contacts: [],
    addresses: [],
    contact_persons: [],
    custom_fields: {}
});

const customFields = ref([]);

const customerTypes = [
    { label: 'Magánszemély', value: 'individual' },
    { label: 'Vállalkozás', value: 'business' }
];

const contactTypes = [
    { label: 'Email', value: 'email', icon: 'pi-envelope' },
    { label: 'Telefon', value: 'phone', icon: 'pi-phone' },
    { label: 'Mobil', value: 'mobile', icon: 'pi-mobile' },
    { label: 'Weboldal', value: 'website', icon: 'pi-globe' },
    { label: 'Egyéb', value: 'other', icon: 'pi-circle' }
];

const addressTypes = [
    { label: 'Számlázási cím', value: 'billing' },
    { label: 'Szállítási cím', value: 'shipping' },
    { label: 'Székhely', value: 'headquarters' },
    { label: 'Telephely', value: 'branch' }
];

const loadCustomer = async () => {
    if (!customerId.value) return;
    
    loading.value = true;
    try {
        const data = await customersApi.get(customerId.value);
        customer.value = data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Hiba',
            detail: 'Nem sikerült betölteni az ügyfél adatait',
            life: 3000
        });
        router.push('/customers');
    } finally {
        loading.value = false;
    }
};

const loadCustomFields = async () => {
    try {
        const data = await settingsApi.customFields.byTarget('customer');
        customFields.value = data || [];
    } catch (error) {
        console.error('Failed to load custom fields:', error);
    }
};

const addContact = () => {
    customer.value.contacts.push({
        contact_type: 'email',
        value: '',
        label: '',
        is_primary: customer.value.contacts.length === 0
    });
};

const removeContact = (index) => {
    customer.value.contacts.splice(index, 1);
};

const addAddress = () => {
    customer.value.addresses.push({
        address_type: 'billing',
        country: 'Magyarország',
        postal_code: '',
        city: '',
        street: '',
        is_primary: customer.value.addresses.length === 0
    });
};

const removeAddress = (index) => {
    customer.value.addresses.splice(index, 1);
};

const addContactPerson = () => {
    customer.value.contact_persons.push({
        first_name: '',
        last_name: '',
        position: '',
        email: '',
        phone: '',
        is_primary: customer.value.contact_persons.length === 0
    });
};

const removeContactPerson = (index) => {
    customer.value.contact_persons.splice(index, 1);
};

const saveCustomer = async () => {
    saving.value = true;
    try {
        if (isEdit.value) {
            await customersApi.update(customerId.value, customer.value);
            toast.add({
                severity: 'success',
                summary: 'Sikeres',
                detail: 'Ügyfél frissítve',
                life: 3000
            });
        } else {
            const result = await customersApi.create(customer.value);
            toast.add({
                severity: 'success',
                summary: 'Sikeres',
                detail: 'Ügyfél létrehozva',
                life: 3000
            });
            router.push(`/customers/${result.id}`);
            return;
        }
        router.push(`/customers/${customerId.value}`);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Hiba',
            detail: error.data?.detail || 'Nem sikerült menteni az ügyfelet',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    loadCustomFields();
    if (isEdit.value) {
        loadCustomer();
    }
});
</script>

<template>
    <div class="card">
        <Toast />
        
        <!-- Header -->
        <div class="flex align-items-center justify-content-between mb-5">
            <div class="flex align-items-center gap-3">
                <Button 
                    icon="pi pi-arrow-left" 
                    rounded 
                    text 
                    @click="router.back()"
                />
                <div>
                    <h2 class="m-0 text-2xl font-semibold">
                        {{ isEdit ? 'Ügyfél szerkesztése' : 'Új ügyfél' }}
                    </h2>
                    <p v-if="isEdit && customer.display_name" class="mt-1 mb-0 text-color-secondary">
                        {{ customer.display_name }}
                    </p>
                </div>
            </div>
            <div class="flex gap-2">
                <Button 
                    label="Mégse" 
                    severity="secondary" 
                    outlined
                    @click="router.back()"
                />
                <Button 
                    label="Mentés" 
                    icon="pi pi-check"
                    :loading="saving"
                    @click="saveCustomer"
                />
            </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-8">
            <ProgressSpinner />
        </div>

        <TabView v-else>
            <!-- Basic Info Tab -->
            <TabPanel header="Alapadatok">
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <label class="block text-900 font-medium mb-2">Ügyfél típusa *</label>
                            <SelectButton 
                                v-model="customer.customer_type" 
                                :options="customerTypes"
                                optionLabel="label"
                                optionValue="value"
                            />
                        </div>
                    </div>
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <label class="block text-900 font-medium mb-2">Belső azonosító</label>
                            <InputText v-model="customer.identifier" class="w-full" placeholder="pl. UGYF-001" />
                        </div>
                    </div>

                    <!-- Individual fields -->
                    <template v-if="customer.customer_type === 'individual'">
                        <div class="col-12 md:col-6">
                            <div class="mb-4">
                                <label class="block text-900 font-medium mb-2">Vezetéknév *</label>
                                <InputText v-model="customer.last_name" class="w-full" />
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="mb-4">
                                <label class="block text-900 font-medium mb-2">Keresztnév *</label>
                                <InputText v-model="customer.first_name" class="w-full" />
                            </div>
                        </div>
                    </template>

                    <!-- Business fields -->
                    <template v-else>
                        <div class="col-12">
                            <div class="mb-4">
                                <label class="block text-900 font-medium mb-2">Cégnév *</label>
                                <InputText v-model="customer.company_name" class="w-full" />
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="mb-4">
                                <label class="block text-900 font-medium mb-2">Adószám</label>
                                <InputText v-model="customer.tax_number" class="w-full" placeholder="12345678-1-23" />
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <div class="mb-4">
                                <label class="block text-900 font-medium mb-2">Cégjegyzékszám</label>
                                <InputText v-model="customer.registration_number" class="w-full" placeholder="01-09-123456" />
                            </div>
                        </div>
                    </template>

                    <div class="col-12">
                        <div class="mb-4">
                            <label class="block text-900 font-medium mb-2">Megjegyzés</label>
                            <Textarea v-model="customer.notes" class="w-full" rows="3" />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="flex align-items-center">
                            <Checkbox v-model="customer.is_active" :binary="true" inputId="is_active" />
                            <label for="is_active" class="ml-2">Aktív ügyfél</label>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <!-- Contacts Tab -->
            <TabPanel header="Elérhetőségek">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0">Kapcsolati adatok</h5>
                    <Button label="Új elérhetőség" icon="pi pi-plus" size="small" @click="addContact" />
                </div>

                <div v-if="customer.contacts.length === 0" class="text-center py-5 text-color-secondary">
                    <i class="pi pi-phone text-4xl mb-3"></i>
                    <p class="m-0">Még nincs elérhetőség megadva</p>
                </div>

                <div v-for="(contact, index) in customer.contacts" :key="index" class="grid surface-100 border-round p-3 mb-3">
                    <div class="col-12 md:col-3">
                        <label class="block text-900 font-medium mb-2">Típus</label>
                        <Select 
                            v-model="contact.contact_type" 
                            :options="contactTypes"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                        />
                    </div>
                    <div class="col-12 md:col-4">
                        <label class="block text-900 font-medium mb-2">Érték *</label>
                        <InputText v-model="contact.value" class="w-full" />
                    </div>
                    <div class="col-12 md:col-3">
                        <label class="block text-900 font-medium mb-2">Címke</label>
                        <InputText v-model="contact.label" class="w-full" placeholder="pl. Munkahelyi" />
                    </div>
                    <div class="col-12 md:col-2 flex align-items-end gap-2">
                        <Checkbox v-model="contact.is_primary" :binary="true" inputId="primary" />
                        <label for="primary" class="text-sm">Elsődleges</label>
                        <Button icon="pi pi-trash" severity="danger" text rounded @click="removeContact(index)" />
                    </div>
                </div>
            </TabPanel>

            <!-- Addresses Tab -->
            <TabPanel header="Címek">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0">Címek</h5>
                    <Button label="Új cím" icon="pi pi-plus" size="small" @click="addAddress" />
                </div>

                <div v-if="customer.addresses.length === 0" class="text-center py-5 text-color-secondary">
                    <i class="pi pi-map-marker text-4xl mb-3"></i>
                    <p class="m-0">Még nincs cím megadva</p>
                </div>

                <div v-for="(address, index) in customer.addresses" :key="index" class="surface-100 border-round p-4 mb-3">
                    <div class="grid">
                        <div class="col-12 md:col-4">
                            <label class="block text-900 font-medium mb-2">Cím típusa</label>
                            <Select 
                                v-model="address.address_type" 
                                :options="addressTypes"
                                optionLabel="label"
                                optionValue="value"
                                class="w-full"
                            />
                        </div>
                        <div class="col-12 md:col-4">
                            <label class="block text-900 font-medium mb-2">Irányítószám *</label>
                            <InputText v-model="address.postal_code" class="w-full" />
                        </div>
                        <div class="col-12 md:col-4">
                            <label class="block text-900 font-medium mb-2">Város *</label>
                            <InputText v-model="address.city" class="w-full" />
                        </div>
                        <div class="col-12">
                            <label class="block text-900 font-medium mb-2">Utca, házszám *</label>
                            <InputText v-model="address.street" class="w-full" />
                        </div>
                        <div class="col-12 flex justify-content-between align-items-center">
                            <div class="flex align-items-center gap-2">
                                <Checkbox v-model="address.is_primary" :binary="true" />
                                <span class="text-sm">Elsődleges cím</span>
                            </div>
                            <Button icon="pi pi-trash" label="Törlés" severity="danger" text size="small" @click="removeAddress(index)" />
                        </div>
                    </div>
                </div>
            </TabPanel>

            <!-- Contact Persons Tab (only for business) -->
            <TabPanel v-if="customer.customer_type === 'business'" header="Kapcsolattartók">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0">Kapcsolattartók</h5>
                    <Button label="Új kapcsolattartó" icon="pi pi-plus" size="small" @click="addContactPerson" />
                </div>

                <div v-if="customer.contact_persons.length === 0" class="text-center py-5 text-color-secondary">
                    <i class="pi pi-user text-4xl mb-3"></i>
                    <p class="m-0">Még nincs kapcsolattartó megadva</p>
                </div>

                <div v-for="(person, index) in customer.contact_persons" :key="index" class="surface-100 border-round p-4 mb-3">
                    <div class="grid">
                        <div class="col-12 md:col-4">
                            <label class="block text-900 font-medium mb-2">Vezetéknév *</label>
                            <InputText v-model="person.last_name" class="w-full" />
                        </div>
                        <div class="col-12 md:col-4">
                            <label class="block text-900 font-medium mb-2">Keresztnév *</label>
                            <InputText v-model="person.first_name" class="w-full" />
                        </div>
                        <div class="col-12 md:col-4">
                            <label class="block text-900 font-medium mb-2">Beosztás</label>
                            <InputText v-model="person.position" class="w-full" />
                        </div>
                        <div class="col-12 md:col-6">
                            <label class="block text-900 font-medium mb-2">Email</label>
                            <InputText v-model="person.email" type="email" class="w-full" />
                        </div>
                        <div class="col-12 md:col-6">
                            <label class="block text-900 font-medium mb-2">Telefon</label>
                            <InputText v-model="person.phone" class="w-full" />
                        </div>
                        <div class="col-12 flex justify-content-between align-items-center">
                            <div class="flex align-items-center gap-2">
                                <Checkbox v-model="person.is_primary" :binary="true" />
                                <span class="text-sm">Elsődleges kapcsolattartó</span>
                            </div>
                            <Button icon="pi pi-trash" label="Törlés" severity="danger" text size="small" @click="removeContactPerson(index)" />
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>
