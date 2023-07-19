import { markup, textNode, version, mount } from '../node_modules/slingjs/sling.min';
import SlingTableComponent from './components/table.component';

class HelloWorldComponent {

    view() {
        return markup('h1', {
            attrs: {
                style: 'color: #808080;',
                class: 'div-content',
                id: 'tagHello'
            },
            children: [
                textNode('Sling.js v' + version())
            ]
        })
    }
}

const helloComponent = new HelloWorldComponent();
mount('tagHello', helloComponent);

const data = [
    {
        make: 'Honda',
        model: 'Accord',
        color: 'White'
    },
    {
        make: 'Toyota',
        model: 'Camry',
        color: 'Gray'
    },
    {
        make: 'Honda',
        model: 'CRV',
        color: 'Red'
    },
    {
        make: 'Toyota',
        model: 'Corolla',
        color: 'Yellow'
    },
    {
        make: 'Nissan',
        model: 'Altima',
        color: 'Silver'
    },
    {
        make: 'Nissan',
        model: 'Maxima',
        color: 'Red'
    },
    {
        make: 'Mazda',
        model: 'CX-3',
        color: 'Blue'
    },
    {
        make: 'Ford',
        model: 'F-150',
        color: 'Tan'
    },
    {
        make: 'Ford',
        model: 'Fiesta',
        color: 'Yellow'
    },
    {
        make: 'Mazda',
        model: 'CX-5',
        color: 'Silver'
    },
    {
        make: 'Mercedes',
        model: 'E 350',
        color: 'Silver'
    }
];

const fields = [
    'make',
    'model',
    'color'
];

const headers = [
    'Make',
    'Model',
    'Color'
];

const testTable = new SlingTableComponent(data, fields, headers, 'testTable', { 
    editable: true, 
    exportable: true,
    rows: 5, 
    tableStyle: 'width: calc(100% - 2rem);table-layout: fixed;margin:1rem;', 
    globalSearch: true, 
    sortable: true, 
    enableRowDeletion: true,
    deleteCallback: (index) => { if (index >= 0) return true; },
    cellStyleList: [(row, field) => { 
        if (row[field] === 'Honda') return 'background-color: rgba(255,0,0,0.3);'; 
        else if (row[field] === 'Ford') return 'background-color: rgba(0,0,255,0.3);'; 
        else return ''; 
    }] 
});
mount('testTable', testTable);