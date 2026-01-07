(function($) {
    'use strict';

    let cities = [];
    let currentSelection = -1;
    let filteredCities = [];
    let searchTimeout = null;
    let isLoading = false;
    let isLoaded = false;

    // Debounce function
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(searchTimeout);
                func(...args);
            };
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(later, wait);
        };
    }

    // Fetch cities from API
    function loadCities() {
        if (isLoading || isLoaded) {
            return Promise.resolve(cities);
        }

        isLoading = true;
        const apiUrl = citySearchData.apiUrl;
        const $loading = $('#city-search-loading');
        
        $loading.show();

        return fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch cities: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // Handle different possible API response formats
                if (Array.isArray(data)) {
                    cities = data;
                } else if (data.cities && Array.isArray(data.cities)) {
                    cities = data.cities;
                } else if (data.data && Array.isArray(data.data)) {
                    cities = data.data;
                } else {
                    console.error('Unexpected API response format', data);
                    cities = [];
                }
                
                // Ensure cities have name and slug
                cities = cities.filter(city => city.name && city.slug);
                isLoaded = true;
                isLoading = false;
                $loading.hide();
                return cities;
            })
            .catch(error => {
                console.error('Error loading cities:', error);
                cities = [];
                isLoading = false;
                isLoaded = false;
                $loading.hide();
                
                // Show error message in suggestions
                const $suggestions = $('#city-search-suggestions');
                $suggestions.html('<div class="city-search-suggestion-item empty">' + 
                    citySearchData.loadingText + ' ' + 
                    '<span style="color: var(--bad);">(' + error.message + ')</span>' +
                    '</div>').addClass('active');
                
                return [];
            });
    }

    // Filter cities based on search term
    function filterCities(term) {
        if (!term || term.length < 2) {
            return [];
        }

        const lowerTerm = term.toLowerCase().trim();
        const results = cities.filter(city => {
            const name = (city.name || '').toLowerCase();
            return name.includes(lowerTerm);
        });

        // Sort: exact matches first, then starts with, then contains
        return results.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const termLower = lowerTerm;

            if (aName === termLower) return -1;
            if (bName === termLower) return 1;
            if (aName.startsWith(termLower)) return -1;
            if (bName.startsWith(termLower)) return 1;
            return 0;
        }).slice(0, 10); // Limit to 10 suggestions
    }

    // Render suggestions dropdown
    function renderSuggestions(suggestions, searchTerm) {
        const $container = $('#city-search-suggestions');
        const $input = $('#city-search-input');
        
        $container.empty();
        currentSelection = -1;

        if (suggestions.length === 0) {
            if (searchTerm && searchTerm.length >= 2) {
                $container.html('<div class="city-search-suggestion-item empty">' + 
                    citySearchData.noResultsText + '</div>').addClass('active');
                $input.attr('aria-expanded', 'true');
            } else {
                $container.removeClass('active');
                $input.attr('aria-expanded', 'false');
            }
            return;
        }

        $container.addClass('active');
        $input.attr('aria-expanded', 'true');
        
        suggestions.forEach((city, index) => {
            const item = $('<div>')
                .addClass('city-search-suggestion-item')
                .attr('role', 'option')
                .attr('id', 'city-suggestion-' + index)
                .attr('data-index', index)
                .attr('data-slug', city.slug || '')
                .attr('data-name', city.name || '')
                .html('<strong>' + escapeHtml(city.name) + '</strong>')
                .on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    selectCity(city);
                })
                .on('mouseenter', function() {
                    $('.city-search-suggestion-item').removeClass('selected');
                    $(this).addClass('selected');
                    currentSelection = index;
                    $input.attr('aria-activedescendant', 'city-suggestion-' + index);
                });

            $container.append(item);
        });
    }

    // Select a city and navigate to it
    function selectCity(city) {
        if (!city || !city.slug) {
            return;
        }

        const url = citySearchData.baseUrl + city.slug;
        
        // Add loading state to button
        const $button = $('.city-search-button');
        const originalText = $button.text();
        
        $button.prop('disabled', true);
        $button.text(citySearchData.loadingText);
        
        // Navigate
        window.location.href = url;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Handle search input with debouncing
    const debouncedSearch = debounce(function(term) {
        filteredCities = filterCities(term);
        renderSuggestions(filteredCities, term);
    }, 200);

    // Initialize when DOM is ready
    $(document).ready(function() {
        const $form = $('#city-search-form');
        const $input = $('#city-search-input');
        const $suggestions = $('#city-search-suggestions');
        const $wrapper = $('#city-search-wrapper');

        if (!$form.length || !$input.length) {
            return; // Block not present on page
        }

        // Load cities on page load
        loadCities().then(() => {
            if (cities.length > 0) {
                console.log(`Loaded ${cities.length} cities`);
            }
        });

        // Handle input changes with debouncing
        $input.on('input', function() {
            const term = $(this).val().trim();
            
            if (term.length < 2) {
                $suggestions.removeClass('active');
                $input.attr('aria-expanded', 'false');
                filteredCities = [];
                return;
            }

            // Wait for cities to load if not loaded yet
            if (!isLoaded && !isLoading) {
                loadCities().then(() => {
                    debouncedSearch(term);
                });
            } else if (isLoaded) {
                debouncedSearch(term);
            }
        });

        // Handle form submission
        $form.on('submit', function(e) {
            e.preventDefault();
            const term = $input.val().trim();

            if (term.length === 0) {
                $input.focus();
                return;
            }

            // If there's a selected suggestion, use it
            if (currentSelection >= 0 && filteredCities[currentSelection]) {
                selectCity(filteredCities[currentSelection]);
                return;
            }

            // Otherwise, try to find exact match or first match
            const exactMatch = cities.find(city => 
                city.name.toLowerCase() === term.toLowerCase()
            );

            if (exactMatch) {
                selectCity(exactMatch);
            } else if (filteredCities.length > 0) {
                selectCity(filteredCities[0]);
            } else {
                // No match found - could show message or do nothing
                $suggestions.removeClass('active');
            }
        });

        // Handle keyboard navigation
        $input.on('keydown', function(e) {
            const $items = $('.city-search-suggestion-item:not(.empty)');

            if (!$suggestions.hasClass('active') || $items.length === 0) {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    $form.submit();
                }
                return;
            }

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    currentSelection = (currentSelection + 1) % $items.length;
                    $items.removeClass('selected')
                          .eq(currentSelection)
                          .addClass('selected')
                          .each(function() {
                              const element = this;
                              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          });
                    $input.attr('aria-activedescendant', 'city-suggestion-' + currentSelection);
                    break;
                
                case 'ArrowUp':
                    e.preventDefault();
                    currentSelection = currentSelection <= 0 ? $items.length - 1 : currentSelection - 1;
                    $items.removeClass('selected')
                          .eq(currentSelection)
                          .addClass('selected')
                          .each(function() {
                              const element = this;
                              element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          });
                    $input.attr('aria-activedescendant', 'city-suggestion-' + currentSelection);
                    break;
                
                case 'Enter':
                    e.preventDefault();
                    if (currentSelection >= 0 && filteredCities[currentSelection]) {
                        selectCity(filteredCities[currentSelection]);
                    } else {
                        $form.submit();
                    }
                    break;
                
                case 'Escape':
                    e.preventDefault();
                    $suggestions.removeClass('active');
                    currentSelection = -1;
                    $input.attr('aria-expanded', 'false');
                    $input.focus();
                    break;
                
                case 'Tab':
                    // Allow tab to close suggestions
                    $suggestions.removeClass('active');
                    currentSelection = -1;
                    $input.attr('aria-expanded', 'false');
                    break;
            }
        });

        // Close suggestions when clicking outside
        $(document).on('click', function(e) {
            if (!$wrapper.is(e.target) && $wrapper.has(e.target).length === 0) {
                $suggestions.removeClass('active');
                currentSelection = -1;
                $input.attr('aria-expanded', 'false');
            }
        });

        // Handle focus
        $input.on('focus', function() {
            const term = $(this).val().trim();
            if (term.length >= 2 && filteredCities.length > 0) {
                renderSuggestions(filteredCities, term);
            }
        });

        // Handle blur (with delay to allow click events)
        $input.on('blur', function() {
            setTimeout(function() {
                if (!$suggestions.is(':hover') && $(':focus').length === 0) {
                    $suggestions.removeClass('active');
                    $input.attr('aria-expanded', 'false');
                }
            }, 200);
        });

        // Prevent suggestions from closing when clicking inside
        $suggestions.on('mousedown', function(e) {
            e.preventDefault();
        });
    });

})(jQuery);
