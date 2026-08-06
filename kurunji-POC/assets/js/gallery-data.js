// Centralized POC Data for Kurunji Fun World Gallery
// Replace with real client images when available.

const galleryData = [
    {
        id: 'gal-1',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFD3ebzzc-7Bp9SB6VhJcf_nbK9TVQc1Cr27zdXsU63yP8uLAC_PAoCnYoy3tzhaW7PchyeOMz9FLEnZ9F5HM4EtknUPdNS1xr_doiXreUqfjzSyEFaCaHE3cIvzH9zJ7ayVwoHlb5GP6B1h7gdegb0p7lzpBCaswMjCjSZQoPmOODA_pS1foJnPbEoCAHAknV6jcYFaGCLGMS0WyNt5TbR4-3f520AoQYDWIA0Ubnz4lZbq5dBkEfzQ',
        alt: 'A young man ziplining across a large, vibrant indoor hall.',
        categories: ['Attractions', 'Inside the Park'],
        has360: true
    },
    {
        id: 'gal-2',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwu4hp34A-Y6EaDxqgHHBVINlg4uhE65GhjSeTksz_SLh0PDV5eL_xKGHnH-RRMv1fZqSKr9IARFaHNH4_As_ktkYc4n8lPLYk47ZB7H8wi6S7_vWhdK7DRybqdlrD7ob91fuk4Yy8yjDLdsxiw_Ea5y7Aqc_ODhdbBuGMDx5rk4tWvCsZwA4hr3HmBf84OSSSIr9O_ZJAQc68r10SbjKyKUAWCV8S48UOjPrCYaTiYZGDXbk-_xY92g',
        alt: 'A cutting-edge VR simulator pod with 4D movement capabilities.',
        categories: ['Attractions'],
        has360: true
    },
    {
        id: 'gal-3',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1rfXh_vmQ0Mo0zM_9Illa4v5Iy7CPKol7qtzoeVwJgONEuHDwHlnoYylx6tLGI42Y3S69xpPaUjTXMM_jDNqcrgYTTfLkaPDaKeSap0XpC8hL2kwMFXxR79fSPMh-KQqH2dI75xcsoCyE-rKaSENvFokGo0Gs_pDoV0AQvqCLdRUnjq9ErBiav-1dEAcLZjoR57Q04_n27xyf3JWekPnz-IgH-JT6NR2_CssV3QTviqhg42ujOz7NOA',
        alt: 'An expansive multi-level soft-play structure for kids.',
        categories: ['Kids', 'Inside the Park', 'Family'],
        has360: false,
        hasVideo: true
    },
    {
        id: 'gal-4',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3w6UTTlB0A2b0aHKdyd88vJds2yUXLMgR6PP30yqLcFvl8uL5KyhN6VZXCgXM2AwLvu0-WNYBXdugAd6uhZ2_iuj3UCJAVoR-hqnKP7o-C4IjraErtsfJmdfD0u47ZB18Sc8fgd57QTOqz4t98n6UkKVbrx6rP2zLv82tEO8Wl5tuy17reUKKGIuDZOqtSNIuc__0GwQMz4KE-srpgVAlNBv1FUsPikx5NYufAxdbQoDoRqoaU3LAlg',
        alt: 'Teenagers cheering while playing a competitive basketball arcade game.',
        categories: ['Family Fun', 'Attractions'],
        has360: true
    },
    {
        id: 'gal-5',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYxbSxotrL1ZU9OpvhH6CpuYnMtEkGQbUtHJt5qXj1F71IUnfaqDWI3MjSoAB-yzlmlwyadnAaKd0eR-wAt68Urex09CdVWuJYbITDqMOYdIbUAeJFdcs9pzd14-h2187bd1Tu2ss8kLWACmSlduO1MWMGElSA6V_DVFuv6Lm4AO8lwcS7b2kjZpzo0cXD3J7Z6JzITDgeQkIS7gKP-HK18QREYZhX5yXo9FGIA89VjmWH2VljEN6AXw',
        alt: 'Navigating a modern ropes course indoors.',
        categories: ['Attractions', 'Inside the Park'],
        has360: false
    },
    {
        id: 'gal-6',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk9YcCKiEQxDcXoffBAkWyJM664LZhBbCZt5NqiVGZr-OKEdjo7JW-jR0zHHbEMuwqUbU0DxfLnV8N8gFRq8ktkueA22z_5BQhVehpLvTvGzYibNLhe_VJl57s3iL4SL0b0mls1lEbYgdHuPne3KJmufarAP56PKdtuzLQxk1EV4l3MgoGV2u10GCjt4EZaBEi_UORoUyTYeCy0GZHuwzBpMtZ6YtI8L9ZExC2r_w6_x_F-2oeQ-_5_g',
        alt: 'Parent and child laughing while trying out a racing simulator.',
        categories: ['Family Fun'],
        has360: false
    },
    {
        id: 'gal-7',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHQ-Z7gMYX3s-qSygqg2d9-Q9A149yzH9AZypUkZM3QkkDefeZqNsQA9grXlNL_-ChkYWQZ0rhk3B9uRHmzo6YLbAKeco6Xf_50KMe0WudEXdMnP4UJYeoiDIhYA5jV_CyJXCwM3Hx-tCYiaetdmSKYyKok3Y6r_IkzPUP6gpLH13GQcp5ZVDD_tTVaW1nPi0LkZC3YyNuz-H5qBb5tAaZH3DhanwlyeCMsxhIX8tfIS7jLIIX-L9wQw',
        alt: 'Team building in a high-tech corporate zone.',
        categories: ['Inside the Park'],
        has360: true
    },
    {
        id: 'gal-8',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMEHzIOL83FVCHP2kI-LcFrcpJ2BKTHUs4s9_JsaEzn5mDZFfbsf-d9vT6aiG4ILfh0Idi_MpFdDYFClug95eYbnVspyLUUdxTjhk83EvcYpT2-ND9UoH5hKW_Q72_BNBHbKc68Vsoa6ikBP4FsWEhg-TrhLOMf6ZhPgIqe40L7lp9wqeQpdqQuG8KluEUO3NytWGZaw8wRmAQbQl_pCHEJz_CVkhwEt9WkNlNuePMG48q3QVl-4Fn5w',
        alt: 'A dramatic shot of the park main entryway at night.',
        categories: ['Inside the Park'],
        has360: false
    },
    {
        id: 'gal-9',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3tIjvUYlikY7t3mi5DRvfDoaJNWVICiTyyWqjGvLzZrFAgVojTF-pSRYJ9ZJvLcA7xOm1Gpt8bbYspFRE93fF7-8OJWtx3oU0BDTZ7je_5WlnqaG0ooMGerpRpXXKvazzOvCKnj2_bTMfER4P1DHodFSJMN8SF_92WL29hjbZbqwoRTGBkV1H4irNYCIe_tT2QfyDE-Q8ZNgb8MR6PRML1__iAQbwcvvtGt2Y6_q5VMtnhrLwugv-KQ',
        alt: 'Toddler playing with giant foam blocks.',
        categories: ['Kids', 'Family Fun'],
        has360: false
    },
    {
        id: 'gal-10',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6GBSHtZDP0RCCnH7p-eDHhwmJrMCsCDon2KydgFXVIRA_S03L3DYDkTNPu0WxPaKM8VsbllH5Kmob7QYSyyyaQBdt15DF964J-4Eqdfzkx4nKgvcoTNPF-s9hJsLcjc7UQXY_aiwMCSBJoKqBTwGBz_K_ZXOXLjuGvkKHVMsNWSAlxuJP4itNf3BC05kTkn8guMCtW9N8S_c9sipJS5_kwEg4mO0hj-txzOr3RVnZF-VZX9sy80-tOw',
        alt: 'Interactive floor tiles lighting up.',
        categories: ['Attractions', 'Family Fun', 'Inside the Park'],
        has360: false
    },
    {
        id: 'gal-11',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB53PL226Ug8Lk0kFnik6VZVQYtXVnOFZySJadvTZARYqsTYvzasEsjIdQwUargmiySXrbGHQoRsBB3rZndgNO6KoF-8HLXlclpnh52jFjyHICuJJ4RbkvwhCkJIqj5NvDdxv9p8Q8Y4zpNtrC2gpPUPH3omxS_-J-DdQIZ67Bcnoo4aAlCFTC-WFYDTgnoU7tejofOKUugKOMQY0_UlgRSmfXOTRaUaMMnxL-9YKm8aKT9OpxiGF2e5g',
        alt: 'Couple posing in front of a modern mural.',
        categories: ['Family Fun'],
        has360: false
    },
    {
        id: 'gal-12',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzASf6PeZ5vgmk4MM6J2lqBkVteSuypVM-ON5KCbVEk19Qi5IrevtfJqcDdHC6N4tW3B0kIQXwJy8HL5eXSAY2Mo3h1VAJRlu_RFUUw1Nf34xFhw3q-UB2_lsZ4F8jLEbXmjbrvDowxT8kMv4vMtolbCfWVMPkBnHtvkFy57JAK4ZqiGckSKuQb2RxZTXZn737HaK45pSNP5wBCGu-n_NdnHcRDK--4ADnvP_jgLCIXC8Kbj5Z8BavWw',
        alt: 'Vibrant interior of the Kids Zone.',
        categories: ['Kids', 'Inside the Park'],
        has360: true
    }
];
