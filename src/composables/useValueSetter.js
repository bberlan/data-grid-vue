
export function useValueSetter(columnDefs) {
    const setValueSetter = () => {
        columnDefs.value.forEach(def => def.valueSetter &&= getValueSetter(def.valueSetter))
    }

    const getValueSetter = name => {
        switch (name) {
            case 'caseSetter':
                return caseSetter;
            default:
                break;
        }
    }

    const caseSetter = params => {
        params.data.caseId = params.newValue
        params.data.caseNo = caseLookups.find(a => a.id === params.newValue)?.caseNo
        return true
    }

    setValueSetter()
}