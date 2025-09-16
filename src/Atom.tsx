import { atom } from "recoil";

export const isMobileState = atom({
    key: 'isMobileState',
    default: window.innerWidth < 640 ? true : false
});

export const powerOnState = atom({
    key: 'powerOn',
    default: false
})

export const gameboyHeightState = atom({
    key: 'gameboyHeight',
    default: 0
})

export const gameboyWidthState = atom({
    key: 'gameboyWidth',
    default: 0
})


// export const 

