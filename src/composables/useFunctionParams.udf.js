
export function useUDFParams(name) {
    const doUDFParams = () => {
        switch (name) {
            case 'test':
                break;
            default:
                break;
        }
    }

    const defaultParams = params => {
        return {
            continue: params.length,
            message: null
        }
    }

    switch (name) {
        case 'testParams':
            return defaultParams
        default:
            return defaultParams
    }
}