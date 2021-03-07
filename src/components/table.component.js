import { markup, textNode } from "slingjs";

class SlingTableComponent {

    constructor(data, fields, headers, id, opts) {
        this.setData(data);
        this.setFields(fields);
        this.setHeaders(headers);
        this.setId(id);
        this.setOpts(opts);
    }

    getData() {
        return this.data;
    }

    getFields() {
        return this.fields;
    }

    getHeaders() {
        return this.headers;
    }

    getId() {
        return this.id;
    }

    getOpts() {
        return this.opts;
    }

    setOpts(opts) {
        this.opts = opts;

        if (!this.opts) {
            this.opts = {};
        }

        this.rows = this.opts.rows;
        this.cellStyleFunctions = this.opts.cellStyleList;
    }

    setId(id) {
        this.id = id;

        if (!this.id) {
            this.id = '';
        }
    }

    setHeaders(headers) {
        if (!headers) {
            this.headers = [];
            this.fields.forEach(field => {
                this.headers.push(field);
            })
        } else {
            this.headers = headers;
        }
    }

    setFields(fields) {
        if (!fields) {
            if (this.data.length > 0 && typeof this.data[0] === 'object') {
                this.fields = Object.keys(this.data[0]);
            } else {
                this.fields = [];
            }
        } else {
            this.fields = fields;
        }
    }

    setData(newData) {
        if (!newData) {
            newData = [];
        }

        this.data = newData;

        this.editingFlags = [];
        this.data.forEach(row => {
            this.editingFlags.push(false);
        });

        this.sortOrder = 'desc';
        this.sortField = null;
        this.globalSearch = '';
        this.displayData = null;
        this.page = 0;
        this.targetInput = null;
    }

    downloadFile(data) {
        if (!data || data.length === 0 || typeof data[0] !== 'object') {
            return;
        }

        const replacer = (key, value) => (!value ? '' : value);
        const header = Object.keys(data[0]);
        const csv = data.map((row) =>
            header
                .map((fieldName) => JSON.stringify(row[fieldName], replacer))
                .join(',')
        );
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n');

        const a = document.createElement('a');
        const blob = new Blob([csvArray], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        a.href = url;
        a.download = 'download.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    isEditingRow() {
        const isEditing = this.editingFlags.find(flag => flag);

        return isEditing !== undefined;
    }

    isEditingRowAtIndex(index) {
        return this.editingFlags[index];
    }

    startEditingRow(index) {
        if (this.isEditingRow()) {
            return;
        }

        this.editingFlags[index] = true;
    }

    endEditRow(index) {
        this.editingFlags[index] = false;

        if (this.targetInput) {
            const tdEle = this.targetInput.parentNode;

            setTimeout(() => {
                const tdSpan = tdEle.children[0];
                tdSpan.style.width = String(tdEle.offsetWidth) + 'px';
                tdSpan.style.display = 'block';
                tdSpan.style.position = 'fixed';
                tdSpan.style.overflow = 'hidden';
                tdSpan.style.textOverflow = 'ellipsis';
                tdSpan.style.whiteSpace = 'nowrap';
            }, 0);
        }
    }

    onEditFieldStart(ctx, event) {
        ctx.targetInput = event.target;
    }

    onEditField(rowObject, field, ctx, event) {
        rowObject[field] = event.target.value;
        ctx.targetInput = event.target;
    }

    buildTableBody(rows) {
        return markup('tbody', {
            attrs: {

            },
            children: rows
        });
    }

    onGlobalSearch(ctx, event) {
        const value = event.target.value;
        ctx.globalSearch = value;
    }

    setSortField(sortField) {
        let index = 0;
        for (let i = 0; i < this.headers.length; ++i) {
            if (this.headers[i] === sortField) {
                index = i;
                break;
            }
        }

        this.sortField = this.fields[index];

        if (this.sortOrder === 'asc') {
            this.sortOrder = 'desc';
        } else {
            this.sortOrder = 'asc';
        }
    }

    buildTableHeader() {
        let columnCount = Array.from(this.headers, (header) => markup('th', {
            attrs: {

            },
            children: [
                textNode(header)
            ]
        })).length;

        if (this.opts.editable === true) {
            columnCount++;
        }

        return markup('thead', {
            attrs: {

            },
            children: [
                markup('tr', {
                    attrs: {

                    },
                    children: [
                        ...(this.opts.editable === true ? [
                            markup('th', {
                                attrs: {
                                },
                                children: [
                                ]
                            })
                        ] : []),
                        ...Array.from(this.headers, (header) => markup('th', {
                            attrs: {

                            },
                            children: [
                                ...(this.opts.sortable === true ? [
                                    markup('span', {
                                        attrs: {
                                            style: 'margin-right: 0.5rem;'
                                        }, children: [
                                            textNode(header)
                                        ]
                                    }),
                                    markup('button', {
                                        attrs: {
                                            onclick: this.setSortField.bind(this, header)
                                        },
                                        children: [
                                            markup('i', {
                                                attrs: {
                                                    class: 'fa fa-sort'
                                                }
                                            })
                                        ]
                                    })
                                ] : []),
                                ...(this.opts.sortable === false ? [
                                    textNode(header)
                                ] : [])
                            ]
                        }))
                    ]
                }),
                ...(this.opts.editable === true ? [markup('tr', {
                    attrs: {

                    },
                    children: [
                        markup('th', {
                            attrs: {
                                colspan: columnCount
                            }, children: [
                                ...(this.opts.exportable === true ? [
                                    markup('button', {
                                        attrs: {
                                            onclick: this.downloadFile.bind(this, this.data)
                                        },
                                        children: [
                                            markup('i', {
                                                attrs: {
                                                    class: 'fa fa-download'
                                                }
                                            }),
                                            markup('span', {
                                                attrs: {
                                                    style: 'margin-left: 0.5rem;'
                                                },
                                                children: [
                                                    textNode('Export')
                                                ]
                                            })
                                        ]
                                    })
                                ] : []),
                                ...(this.opts.exportable === false ? [
                                    textNode('')
                                ] : []),
                            ]
                        })
                    ]
                })] : []),
                ...(this.opts.globalSearch === true ? [markup('tr', {
                    attrs: {

                    },
                    children: [
                        markup('th', {
                            attrs: {
                                colspan: columnCount
                            }, children: [
                                markup('input', {
                                    attrs: {
                                        style: 'width: 100%;',
                                        onkeyup: this.onGlobalSearch.bind(event, this)
                                    }, children: [

                                    ]
                                })
                            ]
                        })
                    ]
                })] : []),
                ...(this.opts.rows ? [
                    markup('tr', {
                        attrs: {

                        },
                        children: [
                            markup('th', {
                                attrs: {
                                    colspan: columnCount
                                },
                                children: [
                                    markup('div', {
                                        attrs: {
                                            style: 'display: flex; justify-content: center;'
                                        },
                                        children: [
                                            markup('button', {
                                                attrs: {
                                                    onclick: this.goToFirstPage.bind(this)
                                                },
                                                children: [
                                                    markup('i', {
                                                        attrs: {
                                                            class: 'fa fa-arrow-circle-left'
                                                        }
                                                    })
                                                ]
                                            }),
                                            markup('button', {
                                                attrs: {
                                                    onclick: this.goToPreviousPage.bind(this)
                                                },
                                                children: [
                                                    markup('i', {
                                                        attrs: {
                                                            class: 'fa fa-arrow-left'
                                                        }
                                                    })
                                                ]
                                            }),
                                            markup('button', {
                                                attrs: {
                                                    onclick: this.goToNextPage.bind(this)
                                                },
                                                children: [
                                                    markup('i', {
                                                        attrs: {
                                                            class: 'fa fa-arrow-right'
                                                        }
                                                    })
                                                ]
                                            }),
                                            markup('button', {
                                                attrs: {
                                                    onclick: this.goToLastPage.bind(this)
                                                },
                                                children: [
                                                    markup('i', {
                                                        attrs: {
                                                            class: 'fa fa-arrow-circle-right'
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ] : [])
            ]
        });
    }

    collectCellStyling(row, field) {
        let cellStyle = '';

        this.cellStyleFunctions.forEach(func => {
            cellStyle += func.call(this, row, field);
        });

        return cellStyle;
    }

    buildTableFields(rowMarkup, row, index) {
        this.fields.forEach(field => {
            let cellStyle = this.collectCellStyling(row, field);
            cellStyle += 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

            const dataMarkup = markup('td', {
                attrs: {
                    ...cellStyle !== '' && { style: cellStyle }
                },
                children: [
                    ...(this.isEditingRowAtIndex(index) === false ? [markup('span', {
                        attrs: {
                        },
                        children: [
                            textNode(row[field])
                        ]
                    })] : []),
                    ...(this.isEditingRowAtIndex(index) === true ? [
                        markup('input', {
                            attrs: {
                                value: row[field],
                                onkeyup: this.onEditField.bind(event, row, field, this),
                                onkeydown: this.onEditFieldStart.bind(event, this)
                            },
                            children: [
                            ]
                        })
                    ] : []),

                ]
            });

            rowMarkup.children.push(dataMarkup);
        });
    }

    goToFirstPage() {
        this.page = 0;
    }

    goToLastPage() {
        this.page = Math.ceil(this.data.length / this.opts.rows) - 1;
    }

    goToNextPage() {
        this.page++;

        const startIndex = this.page * this.opts.rows;

        if (startIndex >= this.data.length) {
            this.page--;
        }
    }

    goToPreviousPage() {
        this.page--;

        if (this.page < 0) {
            this.page = 0;
        }
    }

    buildEditTableColumn(index) {
        return markup('td', {
            attrs: {

            },
            children: [
                ...(this.isEditingRowAtIndex(index) === true ? [markup('button', {
                    attrs: {
                        onclick: this.endEditRow.bind(this, index)
                    },
                    children: [
                        markup('i', {
                            attrs: {
                                class: 'fa fa-floppy-o'
                            }
                        }),
                        markup('span', {
                            attrs: {
                                style: 'margin-left: 0.5rem;'
                            },
                            children: [
                                textNode('Save')
                            ]
                        })
                    ]
                })] : []),
                ...(this.isEditingRowAtIndex(index) === false ? [markup('button', {
                    attrs: {
                        onclick: this.startEditingRow.bind(this, index)
                    },
                    children: [
                        markup('i', {
                            attrs: {
                                class: 'fa fa-pencil'
                            }
                        }),
                        markup('span', {
                            attrs: {
                                style: 'margin-left: 0.5rem;'
                            },
                            children: [
                                textNode('Edit')
                            ]
                        })
                    ]
                })] : []),
            ]
        });
    }

    filterDisplayDataForSearch() {
        if (!this.displayData || this.displayData.length === 0) {
            return;
        }

        if (!this.globalSearch) {
            this.globalSearch = '';
        }

        for (let i = 0; i < this.displayData.length; ++i) {
            const row = this.displayData[i];
            let hasMatch = false;

            for (const [key, value] of Object.entries(row)) {
                if (String(value).toLowerCase().includes(this.globalSearch.toLowerCase())) {
                    hasMatch = true;
                    break;
                }
            }

            if (!hasMatch) {
                this.displayData.splice(i, 1);
                --i;
            }
        }
    }

    sortData() {
        if (!this.sortField || this.sortField === '') {
            return;
        }

        this.data = this.data.sort((a, b) => (a[this.sortField] > b[this.sortField]) ? 1 : -1)
    }

    sortObject(list, key) {
        if (!key || key === '') {
            return list;
        }

        const sorted = list.sort((a, b) => {
            a = a[key];
            b = b[key];
            var type = (typeof (a) === 'string' ||
                typeof (b) === 'string') ? 'string' : 'number';
            var result;

            if (this.sortOrder === 'asc') {
                if (type === 'string') result = a.localeCompare(b);
                else result = a - b;
            } else {
                if (type === 'string') result = b.localeCompare(a);
                else result = b - a;
            }

            return result;
        });

        return sorted;
    }

    setDisplayData() {
        if (this.opts && this.opts.rows) {
            const startIndex = this.page * this.opts.rows;
            
            let endIndex = (this.page * this.opts.rows) + this.opts.rows;

            if (endIndex >= this.data.length) {
                endIndex = this.data.length;
            }

            this.displayData = this.data.slice(startIndex, endIndex);
        } else {
            this.displayData = this.data;
        }
    }

    view() {
        let customTableStyle = null;
        if (this.opts) {
            customTableStyle = this.opts.tableStyle;
        }

        const table = markup('table', {
            attrs: {
                id: this.id,
                class: 'pure-table',
                ...customTableStyle && { style: customTableStyle },
            },
            children: [

            ]
        });

        const rows = [];

        // this.sortData();
        this.data = this.sortObject(this.data, this.sortField);

        this.setDisplayData();

        this.filterDisplayDataForSearch();

        this.displayData.forEach((row, index) => {
            const isOdd = index % 2 !== 0;

            const rowMarkup = markup('tr', {
                attrs: {
                    ...isOdd === true && { class: 'pure-table-odd' },
                },
                children: [

                ]
            });

            if (this.opts.editable) {
                const editDataMarkup = this.buildEditTableColumn(index);
                rowMarkup.children.push(editDataMarkup);
            }

            this.buildTableFields(rowMarkup, row, index);

            rows.push(rowMarkup);
        });

        const thead = this.buildTableHeader();
        const tbody = this.buildTableBody(rows);

        table.children = [thead, tbody];

        return table;
    }
}

export default SlingTableComponent;
