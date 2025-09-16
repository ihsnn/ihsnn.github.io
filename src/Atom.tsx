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

export const gameBoyMenuState = atom({
    key: 'gameBoyMenu',
    default: [
        'start',
        'message',
        'gallery',
        'music',
    ]
})

export const gameBoyMenuIndexState = atom({
    key: 'gameBoyMenuIndex',
    default: 0
})

export const openEnvelopeState = atom({
    key: 'openEnvelope',
    default: false
})

export const gameBoyMessageState = atom({
    key: 'gameBoyMessage',
    default: [
        'Selamat ulang tahun sayangggg \n\n doa aku semoga kamu selalu diberikan kesehatan, kemudahan segala urusan, kebahagiaan, diwujudkan kenginan kamu, dan diberi umur panjang soalnya aku mau menjalani banyak hal dan menua dengan kamu \n semoga Allah mudahkan rejeki kamu, memudahkan kamu untuk menjadi orang yang baik, dan memudahkan kamu untuk menjadi ibu yang baik untuk anak kita \n semoga apapun sakit yang ga penah kamu ceritakan ke siapa-siapa bisa disembuhkan, dan semoga kamu bisa berdamai dengan apapun kegelisahan yang ga pernah kamu bagi ke siapa-siapa \n aku pengen kamu tau aku bakal selalu mendukung kamu, akan selalu membersamai kamu, aku mau kamu bisa menggapai cita-cita kamu \n aku harap hari ini kamu bisa bahagia, besok juga, lusa juga, dannnn seterusnyaaa \n \n i love you, always',
        'I LOVE YOUUUU',
        'I LOVE YOUUUU MOSTTTT',
    ]
})

export const gameBoyMessageIndexState = atom({
    key: 'gameBoyMessageIndex',
    default: 0
})

export const gameBoyMusicState = atom({
    key: 'gameBoyMusic',
    default: [
        {
            title: '폴킴 (Paul Kim) - 너를 만나 (축가 ver)',
            src: '../../../assets/sounds/musics/paul kim-me after you wed ver.mp3'
        }, {
            title: 'Birthday Song',
            src: '../../../assets/sounds/musics/hbd-song.mp3'
        }
    ]
})

export const gameBoyMusicIndexState = atom({
    key: 'gameBoyMusicIndex',
    default: 0
})

export const gameBoyGalleryIndexState = atom({
    key: 'gameBoyGalleryIndex',
    default: 0
})



// export const 

