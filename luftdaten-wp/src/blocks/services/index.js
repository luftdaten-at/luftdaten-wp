(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var Button = components.Button;
    var SelectControl = components.SelectControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/services', {
        title: __('Services List', 'luftdaten'),
        icon: 'admin-generic',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('Unsere Angebote', 'luftdaten'),
            },
            numberOfServices: {
                type: 'number',
                default: 6,
            },
            services: {
                type: 'array',
                default: [
                    {
                        icon: '📊',
                        title: __('Daten & Monitoring', 'luftdaten'),
                        description: __('Echtzeitdaten zur Luftqualität und Hitze in österreichischen Städten. Zugriff auf historische Daten und Analysen.', 'luftdaten'),
                        link: '',
                        linkText: __('Zum Dashboard →', 'luftdaten'),
                    },
                    {
                        icon: '🔬',
                        title: __('Citizen Science Projekte', 'luftdaten'),
                        description: __('Mitmachen bei Forschungsprojekten: Bauen Sie eigene Messstationen und tragen Sie zu wissenschaftlichen Erkenntnissen bei.', 'luftdaten'),
                        link: '',
                        linkText: __('Mehr erfahren →', 'luftdaten'),
                    },
                    {
                        icon: '🎓',
                        title: __('Workshops & Bildung', 'luftdaten'),
                        description: __('Praktische Workshops, Vorträge und Bildungsangebote zu Luftqualität, Hitzeinseln und Klimawandelanpassung.', 'luftdaten'),
                        link: '',
                        linkText: __('Angebote ansehen →', 'luftdaten'),
                    },
                    {
                        icon: '🏢',
                        title: __('Beratung & Forschung', 'luftdaten'),
                        description: __('Wissenschaftliche Beratung für Städte, Gemeinden und Unternehmen bei Klimawandelanpassungsmaßnahmen.', 'luftdaten'),
                        link: '',
                        linkText: __('Kontakt aufnehmen →', 'luftdaten'),
                    },
                    {
                        icon: '📱',
                        title: __('Tools & APIs', 'luftdaten'),
                        description: __('Zugang zu Daten-APIs, Visualisierungstools und Anwendungen für die Analyse von Umweltdaten.', 'luftdaten'),
                        link: '',
                        linkText: __('Tools entdecken →', 'luftdaten'),
                    },
                    {
                        icon: '🤝',
                        title: __('Kooperationen', 'luftdaten'),
                        description: __('Gemeinsame Projekte mit Forschungseinrichtungen, NGOs und öffentlichen Institutionen entwickeln.', 'luftdaten'),
                        link: '',
                        linkText: __('Kontakt aufnehmen →', 'luftdaten'),
                    },
                ],
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            function updateService(index, field, value) {
                var newServices = attributes.services.slice();
                newServices[index] = Object.assign({}, newServices[index], { [field]: value });
                setAttributes({ services: newServices });
            }

            function addService() {
                var newServices = attributes.services.slice();
                newServices.push({
                    icon: '📋',
                    title: '',
                    description: '',
                    link: '',
                    linkText: __('Mehr erfahren →', 'luftdaten'),
                });
                setAttributes({ services: newServices });
            }

            function removeService(index) {
                var newServices = attributes.services.slice();
                newServices.splice(index, 1);
                setAttributes({ services: newServices });
            }

            return el('div', { className: 'luftdaten-services-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(SelectControl, {
                            label: __('Number of Services to Display', 'luftdaten'),
                            value: attributes.numberOfServices,
                            options: [
                                { label: __('3 Services', 'luftdaten'), value: 3 },
                                { label: __('6 Services', 'luftdaten'), value: 6 },
                            ],
                            onChange: function(value) {
                                setAttributes({ numberOfServices: parseInt(value, 10) });
                            }
                        }),
                        el('div', { style: { marginTop: '20px' } },
                            el('strong', { style: { display: 'block', marginBottom: '10px' } }, __('Services', 'luftdaten')),
                            attributes.services.map(function(service, index) {
                                return el(PanelBody, {
                                    key: index,
                                    title: service.title || __('Service', 'luftdaten') + ' ' + (index + 1),
                                    initialOpen: false
                                },
                                    el(TextControl, {
                                        label: __('Icon (Emoji)', 'luftdaten'),
                                        value: service.icon || '',
                                        onChange: function(value) {
                                            updateService(index, 'icon', value);
                                        },
                                        help: __('Enter an emoji (e.g., 📊, 🔬, 🎓)', 'luftdaten')
                                    }),
                                    el(TextControl, {
                                        label: __('Title', 'luftdaten'),
                                        value: service.title || '',
                                        onChange: function(value) {
                                            updateService(index, 'title', value);
                                        }
                                    }),
                                    el('textarea', {
                                        className: 'components-textarea-control__input',
                                        label: __('Description', 'luftdaten'),
                                        value: service.description || '',
                                        onChange: function(e) {
                                            updateService(index, 'description', e.target.value);
                                        },
                                        rows: 3,
                                        style: { width: '100%', marginTop: '8px', marginBottom: '8px' }
                                    }),
                                    el(TextControl, {
                                        label: __('Link URL', 'luftdaten'),
                                        value: service.link || '',
                                        onChange: function(value) {
                                            updateService(index, 'link', value);
                                        },
                                        type: 'url'
                                    }),
                                    el(TextControl, {
                                        label: __('Link Text', 'luftdaten'),
                                        value: service.linkText || '',
                                        onChange: function(value) {
                                            updateService(index, 'linkText', value);
                                        }
                                    }),
                                    el(Button, {
                                        isDestructive: true,
                                        isSmall: true,
                                        onClick: function() {
                                            if (confirm(__('Are you sure you want to remove this service?', 'luftdaten'))) {
                                                removeService(index);
                                            }
                                        },
                                        style: { marginTop: '10px' }
                                    }, __('Remove Service', 'luftdaten'))
                                );
                            }),
                            el(Button, {
                                isPrimary: true,
                                isSmall: true,
                                onClick: addService,
                                style: { marginTop: '10px' }
                            }, __('Add Service', 'luftdaten'))
                        )
                    )
                ),
                el('div', { className: 'luftdaten-services-preview' },
                    el('h3', {}, attributes.title),
                    el('div', { className: 'services-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' } },
                        attributes.services.slice(0, attributes.numberOfServices).map(function(service, index) {
                            return el('div', {
                                key: index,
                                className: 'service-card',
                                style: {
                                    padding: '20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    background: '#fff'
                                }
                            },
                                el('div', { style: { fontSize: '32px', marginBottom: '10px' } }, service.icon || '📋'),
                                el('h4', { style: { margin: '0 0 10px 0', fontSize: '18px' } }, service.title || __('Untitled Service', 'luftdaten')),
                                el('p', { style: { margin: '0 0 10px 0', fontSize: '14px', color: '#666' } }, service.description || ''),
                                service.link ? el('a', { href: service.link, style: { color: '#2e88c1' } }, service.linkText || __('Mehr erfahren →', 'luftdaten')) : null
                            );
                        })
                    )
                )
            );
        },
        save: function() {
            return null; // Dynamic block, rendered server-side
        },
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
);
