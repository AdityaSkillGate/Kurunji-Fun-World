// Centralized POC Data for Kurunji Fun World Attractions
// Replace with real client data when available.

const attractionsData = [
    {
        id: 'high-peak-zipline',
        name: 'High Peak Zipline',
        category: 'Thrill',
        shortDescription: 'Soar through our main hall at exhilarating speeds.',
        fullDescription: 'Experience the ultimate adrenaline rush with our state-of-the-art indoor zip-line. Suspended high above the main hall, you get a bird\'s-eye view of the entire park while safely harnessed in our premium gear.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFD3ebzzc-7Bp9SB6VhJcf_nbK9TVQc1Cr27zdXsU63yP8uLAC_PAoCnYoy3tzhaW7PchyeOMz9FLEnZ9F5HM4EtknUPdNS1xr_doiXreUqfjzSyEFaCaHE3cIvzH9zJ7ayVwoHlb5GP6B1h7gdegb0p7lzpBCaswMjCjSZQoPmOODA_pS1foJnPbEoCAHAknV6jcYFaGCLGMS0WyNt5TbR4-3f520AoQYDWIA0Ubnz4lZbq5dBkEfzQ',
        suitability: 'Ages 12+ | Min Height 120cm',
        has360: true
    },
    {
        id: 'vortex-vr-arena',
        name: 'Vortex VR Arena',
        category: 'Interactive',
        shortDescription: 'Multi-player free-roam VR experiences.',
        fullDescription: 'Enter another dimension in our cutting-edge VR simulator pods. Featuring 4D movement capabilities and the latest in virtual reality technology, it is an immersive experience like no other.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwu4hp34A-Y6EaDxqgHHBVINlg4uhE65GhjSeTksz_SLh0PDV5eL_xKGHnH-RRMv1fZqSKr9IARFaHNH4_As_ktkYc4n8lPLYk47ZB7H8wi6S7_vWhdK7DRybqdlrD7ob91fuk4Yy8yjDLdsxiw_Ea5y7Aqc_ODhdbBuGMDx5rk4tWvCsZwA4hr3HmBf84OSSSIr9O_ZJAQc68r10SbjKyKUAWCV8S48UOjPrCYaTiYZGDXbk-_xY92g',
        suitability: 'Ages 8+',
        has360: true
    },
    {
        id: 'kurunji-kids-world',
        name: 'Kurunji Kids World',
        category: 'Kids',
        shortDescription: 'A vibrant, safe playground for our smallest adventurers.',
        fullDescription: 'Designed specifically for toddlers and young children, this expansive multi-level soft-play structure features safe slides, ball pits, and rope bridges. Fully padded and supervised.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1rfXh_vmQ0Mo0zM_9Illa4v5Iy7CPKol7qtzoeVwJgONEuHDwHlnoYylx6tLGI42Y3S69xpPaUjTXMM_jDNqcrgYTTfLkaPDaKeSap0XpC8hL2kwMFXxR79fSPMh-KQqH2dI75xcsoCyE-rKaSENvFokGo0Gs_pDoV0AQvqCLdRUnjq9ErBiav-1dEAcLZjoR57Q04_n27xyf3JWekPnz-IgH-JT6NR2_CssV3QTviqhg42ujOz7NOA',
        suitability: 'Ages 3-8',
        has360: false
    },
    {
        id: 'neon-strike-bowling',
        name: 'Neon Strike Bowling',
        category: 'Family',
        shortDescription: 'Premium indoor bowling lanes with cosmic lighting.',
        fullDescription: 'Gather your family and friends for a classic game of bowling elevated by modern technology. Features interactive lane graphics, automatic bumpers for kids, and a premium lounge area.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4qUJmSQW_6h2EIwSwD0Luuf92qt1iXANgqYGHgRuC4irs95w7pFUJ37sy_KDnImd69EgXeSMpZgGHubD4YBITxSmRUfThl7VwIh5X76_bfYJVv3adbvo2MDCyhb48Ztjn8aJAuP8ieMVWoQiALC2VfvSVr9cht8CDDfW7IlAUsYJ9oqWyjISlCMfApZz6hmiSsqEPA6Hj_Z3MWF4GnGT4srXzj6KxP9Qz096QaisDNo5x6jOWosd1wg', // Reusing placeholder image
        suitability: 'All Ages',
        has360: false
    },
    {
        id: 'arcade-universe',
        name: 'Arcade Universe',
        category: 'Games',
        shortDescription: 'Dozens of classic and modern arcade games.',
        fullDescription: 'From classic coin-op machines to the latest competitive multiplayer arcade cabinets, Arcade Universe is packed with flashing lights, high scores, and endless fun.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3w6UTTlB0A2b0aHKdyd88vJds2yUXLMgR6PP30yqLcFvl8uL5KyhN6VZXCgXM2AwLvu0-WNYBXdugAd6uhZ2_iuj3UCJAVoR-hqnKP7o-C4IjraErtsfJmdfD0u47ZB18Sc8fgd57QTOqz4t98n6UkKVbrx6rP2zLv82tEO8Wl5tuy17reUKKGIuDZOqtSNIuc__0GwQMz4KE-srpgVAlNBv1FUsPikx5NYufAxdbQoDoRqoaU3LAlg',
        suitability: 'All Ages',
        has360: true
    },
    {
        id: 'sky-ropes-course',
        name: 'Sky Ropes Course',
        category: 'Thrill',
        shortDescription: 'Test your balance on our suspended obstacle course.',
        fullDescription: 'Navigate through a series of challenging obstacles high above the ground. You are safely harnessed in at all times, making this a perfect mental and physical challenge.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYxbSxotrL1ZU9OpvhH6CpuYnMtEkGQbUtHJt5qXj1F71IUnfaqDWI3MjSoAB-yzlmlwyadnAaKd0eR-wAt68Urex09CdVWuJYbITDqMOYdIbUAeJFdcs9pzd14-h2187bd1Tu2ss8kLWACmSlduO1MWMGElSA6V_DVFuv6Lm4AO8lwcS7b2kjZpzo0cXD3J7Z6JzITDgeQkIS7gKP-HK18QREYZhX5yXo9FGIA89VjmWH2VljEN6AXw',
        suitability: 'Ages 10+ | Min Height 130cm',
        has360: false
    },
    {
        id: 'racing-simulators',
        name: 'Pro Racing Simulators',
        category: 'Interactive',
        shortDescription: 'High-speed competitive racing simulators.',
        fullDescription: 'Take the wheel in our professional-grade racing simulators. Feel every bump and turn with force-feedback steering and immersive wrap-around screens.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk9YcCKiEQxDcXoffBAkWyJM664LZhBbCZt5NqiVGZr-OKEdjo7JW-jR0zHHbEMuwqUbU0DxfLnV8N8gFRq8ktkueA22z_5BQhVehpLvTvGzYibNLhe_VJl57s3iL4SL0b0mls1lEbYgdHuPne3KJmufarAP56PKdtuzLQxk1EV4l3MgoGV2u10GCjt4EZaBEi_UORoUyTYeCy0GZHuwzBpMtZ6YtI8L9ZExC2r_w6_x_F-2oeQ-_5_g',
        suitability: 'Ages 12+',
        has360: false
    },
    {
        id: 'toddler-town',
        name: 'Toddler Town',
        category: 'Kids',
        shortDescription: 'A quiet, padded interactive zone for toddlers.',
        fullDescription: 'A dedicated calm space for toddlers with interactive light-up floors, giant soft foam blocks, and sensory toys.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3tIjvUYlikY7t3mi5DRvfDoaJNWVICiTyyWqjGvLzZrFAgVojTF-pSRYJ9ZJvLcA7xOm1Gpt8bbYspFRE93fF7-8OJWtx3oU0BDTZ7je_5WlnqaG0ooMGerpRpXXKvazzOvCKnj2_bTMfER4P1DHodFSJMN8SF_92WL29hjbZbqwoRTGBkV1H4irNYCIe_tT2QfyDE-Q8ZNgb8MR6PRML1__iAQbwcvvtGt2Y6_q5VMtnhrLwugv-KQ',
        suitability: 'Ages 1-4',
        has360: false
    }
];
