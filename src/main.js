import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';
import Tooltip from 'primevue/tooltip';
import Ripple from 'primevue/ripple';
import BadgeDirective from 'primevue/badgedirective';
import StyleClass from 'primevue/styleclass';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
    locale: {
        startsWith: 'Kezdődik',
        contains: 'Tartalmazza',
        notContains: 'Nem tartalmazza',
        endsWith: 'Végződik',
        equals: 'Egyenlő',
        notEquals: 'Nem egyenlő',
        noFilter: 'Nincs szűrő',
        lt: 'Kisebb mint',
        lte: 'Kisebb vagy egyenlő',
        gt: 'Nagyobb mint',
        gte: 'Nagyobb vagy egyenlő',
        dateIs: 'Dátum egyenlő',
        dateIsNot: 'Dátum nem egyenlő',
        dateBefore: 'Dátum előtt',
        dateAfter: 'Dátum után',
        clear: 'Törlés',
        apply: 'Alkalmaz',
        matchAll: 'Minden egyezik',
        matchAny: 'Bármelyik egyezik',
        addRule: 'Szabály hozzáadása',
        removeRule: 'Szabály eltávolítása',
        accept: 'Igen',
        reject: 'Nem',
        choose: 'Választ',
        upload: 'Feltöltés',
        cancel: 'Mégse',
        dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
        dayNamesShort: ['Vas', 'Hét', 'Kedd', 'Sze', 'Csüt', 'Pén', 'Szo'],
        dayNamesMin: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        monthNames: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'],
        today: 'Ma',
        weekHeader: 'Hét',
        firstDayOfWeek: 1,
        dateFormat: 'yy.mm.dd',
        weak: 'Gyenge',
        medium: 'Közepes',
        strong: 'Erős',
        passwordPrompt: 'Adjon meg egy jelszót',
        emptyFilterMessage: 'Nincs találat',
        emptyMessage: 'Nincs elérhető opció',
        aria: {
            trueLabel: 'Igaz',
            falseLabel: 'Hamis',
            nullLabel: 'Nincs kiválasztva',
            pageLabel: 'Oldal',
            firstPageLabel: 'Első oldal',
            lastPageLabel: 'Utolsó oldal',
            nextPageLabel: 'Következő oldal',
            previousPageLabel: 'Előző oldal'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

app.directive('tooltip', Tooltip);
app.directive('ripple', Ripple);
app.directive('badge', BadgeDirective);
app.directive('styleclass', StyleClass);

app.mount('#app');
