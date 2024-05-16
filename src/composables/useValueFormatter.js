import { unref, toRefs, isRef, reactive } from 'vue';
import dayjs from 'dayjs';

export function useValueFormatter(columnDefs, store) {

    const setValueFormatter = () => {
        // const dat = reactive({ columnDefs })
        // console.log('setValueFormatters.columnDefs:', columnDefs.value)
        // console.log('setValueFormatters.columnDefs.length:', columnDefs.value.length)
        // console.log('setValueFormatters.columnDefs.isRef:', isRef(columnDefs.value))
        // dat.columnDefs.forEach(def => console.log('columnDefs.def.isRef', isRef(def)));
        // columnDefs.value.forEach(def => def.valueFormatter &&= getValueFormatter(def.valueFormatter))
        // columnDefs.value.forEach(def => def.valueFormatter && def.valueFormatter.substring(0, 2) === 'gu' && (def.valueFormatter = getValueFormatter(def.valueFormatter)))
        const regex = /[A-Z]/;
        console.log('setValueFormatter.cor:')
        // columnDefs.value.forEach(def => def.valueFormatter && console.log('setValueFormatter:', def.valueFormatter))
        // columnDefs.value.forEach(def => def.valueFormatter && console.log('setValueFormatter.match:', def.valueFormatter.match(regex)))
        // columnDefs.value.forEach(def => def.valueFormatter && def.valueFormatter.match(regex) && console.log('valueFormatter.substring.gui:', def.valueFormatter.substring(0, def.valueFormatter.indexOf(def.valueFormatter.match(regex)[0])) === 'gui'))
        columnDefs.value.forEach(def => def.valueFormatter && typeof def.valueFormatter === 'string' && def.valueFormatter.match(regex) && def.valueFormatter.substring(0, def.valueFormatter.indexOf(def.valueFormatter.match(regex)[0])) === 'gui' && (def.valueFormatter = getValueFormatter(def.valueFormatter)))
        // await Promise.all(columnDefs.value.map(def => def.valueFormatter && typeof def.valueFormatter === 'string' && def.valueFormatter.match(regex) && def.valueFormatter.substring(0, def.valueFormatter.indexOf(def.valueFormatter.match(regex)[0])) === 'gui' && (def.valueFormatter = getValueFormatter(def.valueFormatter))))
    }

    const getValueFormatter = name => {
        switch (name) {
            case 'guiDateFormatter':
                return guiDateFormatter
            case 'guiDatetimeFormatter':
                return guiDatetimeFormatter
            case 'guiNumberFormatter':
                return guiNumberFormatter
            case 'guiUserNameFormatter':
                return guiUserNameFormatter
            default:
                break;
        }
    }

    const guiDateFormatter = params => {
        return params.value && dayjs(params.value).format('MM/DD/YYYY')
    }

    const guiDatetimeFormatter = params => {
        return params.value && dayjs(params.value).format('MM/DD/YYYY hh:mm:ss A')
    }

    const guiNumberFormatter = params => {
        return params.value && formatNumber(params.value)
    }

    const formatNumber = value => {
        return value && value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const guiUserNameFormatter = params => {
        // return store.getters.getAccountData.find(a => a.id === params.value)?.username
        return store.getters.getAccountLookup.find(a => a.id === params.value)?.username
    }

    setValueFormatter()
}