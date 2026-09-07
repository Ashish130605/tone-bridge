export function Button({children , ...props}) {
    return (
        <div>
            <button {...props}> 
                {children}
            </button>
        </div>

    )
}
