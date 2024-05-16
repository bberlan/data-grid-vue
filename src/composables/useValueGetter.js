
export function useValueGetter(columnDefs, store) {

    const setValueGetter = () => {
        columnDefs.value.forEach(def => def.valueGetter &&= getValueGetter(def.valueGetter))
    }

    const getValueGetter = name => {
        switch (name) {
            case 'caseGetter':
                return caseGetter;
            default:
                break;
        }
    }

    const caseGetter = params => {
        return params.data.caseId
    }

    setValueGetter();
}