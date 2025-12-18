export const MONSTERS = [
    { id: 'ghost', name: 'Fantasma Vingativo', type: 'ghost', weakness: ['salt', 'iron'], hp: 50 },
    { id: 'demon', name: 'Demônio de Olhos Pretos', type: 'demon', weakness: ['trap', 'bible'], hp: 100 },
    { id: 'werewolf', name: 'Lobisomem', type: 'werewolf', weakness: ['silver'], hp: 150 },
    { id: 'vampire', name: 'Vampiro', type: 'vampire', weakness: ['dead_mans_blood', 'stake'], hp: 120 },
];

export const ITEMS = [
    { id: 'salt', name: 'Sal Grosso', type: 'material' },
    { id: 'iron', name: 'Pé de Cabra (Ferro)', type: 'weapon' },
    { id: 'silver_bullet', name: 'Bala de Prata', type: 'ammo' },
    { id: 'journal', name: 'Diário de John', type: 'tool' },
];

export interface Poi {
    id: string;
    lat: number;
    lng: number;
    type: 'monster' | 'loot';
    data: any;
}
