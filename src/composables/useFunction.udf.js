import { ref, isRef, unref, watchEffect, reactive, computed } from 'vue'
import { useUDFParams } from './useFunctionParams.udf';
import Modal from 'bootstrap/js/dist/modal'

export async function useUDF(params, props, grid, store, items, actions, modals) {
    const svcUrl = process.env.VUE_APP_SYS_SERVICE_URL;
    const user = computed(() => store.getters.getUser)
    const getDataAction = computed(() => store.getters.getDataAction)
    const setDataAction = (action) => store.commit('setDataAction', action)
    const selectedNodes = reactive([]);
    const itemsToUpdate = reactive([]);
    const columnTypes = reactive({
        entryOnAdd: { editable: false }
    });
    const gridApi = unref(grid.api)
    const columnApi = unref(grid.columnApi)
    const ret = ref(null)

    const doUDF = async () => {
        switch (params.func) {
            case 'paymentTerms':
                paymentTerms()
                    .catch(reason => reason && alert(reason))
                break;
            case 'register':
                register()
                    .catch(reason => reason && alert(reason))
                break;
            default:
                break;
        }
    }

    const paymentTerms = async () => {
        console.log('paymentTerms')
        if (gridApi.getSelectedNodes().length) {
            modals.standard.value.tab = 'paymentterm'
            modals.standard.value.id = gridApi.getSelectedNodes()[0].id
            modals.standard.value.title = 'Payment Terms'
            new Modal('#standardModal').toggle()
        }
    }

    const register = async () => {
        console.log('register:function')
        if (gridApi.getSelectedNodes().length &&
            gridApi.getSelectedRows().every(d => !d.registered) &&
            gridApi.getSelectedRows().every(d => d.email)) {
            modals.option.value.title = 'Choose Accounts'
            if (modals.option.value.options.length === 0)
                modals.option.value.options = store.getters.getAccounts.filter(a => a.option)
            if (modals.option.value.checkedItems.length === 0)
                modals.option.value.checkedItems.splice(0, modals.option.value.checkedItems.length, 6)
            new Modal('#optionModal').toggle()
        }
        else if (gridApi.getSelectedRows().some(d => d.registered)) {
            alert('Some selected record is already registered. Please deselected.')
        }
        else if (gridApi.getSelectedRows().some(d => !d.email)) {
            alert('Some selected record has no email address. Registration is cancelled.')
        }
    }

    await doUDF()

    return ret;
}