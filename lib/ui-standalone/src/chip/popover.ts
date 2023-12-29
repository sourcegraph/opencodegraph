type PRect = Partial<DOMRect> & {
    readonly bottom: number
    readonly height: number
    readonly left: number
    readonly right: number
    readonly top: number
    readonly width: number
}

export function getPopoverDimensions(targetEl: HTMLElement, popoverEl: HTMLElement): { top: string; left: string } {
    return positionTopStart(targetEl.getBoundingClientRect(), popoverEl.getBoundingClientRect())
}

function positionTopStart(targetRect: PRect, popoverRect: PRect): { top: string; left: string } {
    const { directionRight, directionDown } = getCollisions(targetRect, popoverRect)
    return {
        top: directionDown
            ? `${targetRect.top + targetRect.height + window.scrollY}px`
            : `${targetRect.top - popoverRect.height + window.scrollY}px`,
        left: directionRight
            ? `${targetRect.right - popoverRect.width + window.scrollX}px`
            : `${targetRect.left + window.scrollX}px`,
    }
}

function getCollisions(
    targetRect: PRect,
    popoverRect: PRect,
    offsetLeft: number = 0,
    offsetBottom: number = 0
): {
    directionRight: boolean
    directionLeft: boolean
    directionUp: boolean
    directionDown: boolean
} {
    const collisions = {
        top: targetRect.top - popoverRect.height < 0,
        right: window.innerWidth < targetRect.left + popoverRect.width - offsetLeft,
        bottom: window.innerHeight < targetRect.bottom + popoverRect.height - offsetBottom,
        left: targetRect.left + targetRect.width - popoverRect.width < 0,
    }

    const directionRight = collisions.right && !collisions.left
    const directionLeft = collisions.left && !collisions.right
    const directionUp = collisions.bottom && !collisions.top
    const directionDown = collisions.top && !collisions.bottom

    return { directionRight, directionLeft, directionUp, directionDown }
}
