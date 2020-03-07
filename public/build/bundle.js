
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Visa.svelte generated by Svelte v3.19.1 */

    const file = "src/Visa.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let g;
    	let polygon;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			polygon = svg_element("polygon");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(polygon, "points", "-797.8,845.3 -801.1,860.5 -797.1,860.5 -793.9,845.3  ");
    			add_location(polygon, file, 8, 4, 292);
    			attr_dev(path0, "d", "M-803.6,845.3l-4.1,10.3l-1.7-8.8c-0.2-1-1-1.5-1.8-1.5h-6.7l-0.1,0.4c1.4,0.3,2.9,0.8,3.9,1.3c0.6,0.3,0.7,0.6,0.9,1.3   l3.1,12.1h4.2l6.4-15.2H-803.6z");
    			add_location(path0, file, 9, 4, 370);
    			attr_dev(path1, "d", "M-772.5,845.3h-3.4c-0.8,0-1.4,0.4-1.7,1.1l-5.9,14.1h4.1l0.8-2.3h5l0.5,2.3h3.6L-772.5,845.3z M-777.3,855.1l2.1-5.7   l1.2,5.7H-777.3z");
    			add_location(path1, file, 10, 4, 535);
    			attr_dev(path2, "d", "M-788.7,849.5c0-0.5,0.5-1.1,1.7-1.3c0.6-0.1,2.1-0.1,3.9,0.7l0.7-3.2c-0.9-0.3-2.2-0.7-3.7-0.7c-3.9,0-6.6,2.1-6.6,5   c0,2.2,2,3.4,3.4,4.1c1.5,0.7,2,1.2,2,1.9c0,1-1.2,1.5-2.4,1.5c-2,0-3.1-0.5-4-1l-0.7,3.3c0.9,0.4,2.6,0.8,4.4,0.8   c4.1,0,6.8-2,6.8-5.2C-783.2,851.6-788.8,851.3-788.7,849.5z");
    			add_location(path2, file, 11, 4, 684);
    			add_location(g, file, 7, 2, 284);
    			attr_dev(svg, "enable-background", "new -822 823.1 56.7 56.7");
    			attr_dev(svg, "height", "40px");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "-823 837.1 56.7 30");
    			attr_dev(svg, "width", "60.7px");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "svelte-1siikm0");
    			add_location(svg, file, 6, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, polygon);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Visa extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Visa",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Chip.svelte generated by Svelte v3.19.1 */

    const file$1 = "src/Chip.svelte";

    function create_fragment$1(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "chip__left svelte-et51y0");
    			add_location(div0, file$1, 63, 4, 1447);
    			attr_dev(div1, "class", "chip__middle svelte-et51y0");
    			add_location(div1, file$1, 64, 4, 1482);
    			attr_dev(div2, "class", "chip__right svelte-et51y0");
    			add_location(div2, file$1, 65, 4, 1519);
    			attr_dev(div3, "class", "chip svelte-et51y0");
    			add_location(div3, file$1, 62, 0, 1424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Chip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chip",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Creditcard.svelte generated by Svelte v3.19.1 */
    const file$2 = "src/Creditcard.svelte";

    function create_fragment$2(ctx) {
    	let div13;
    	let div9;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = (/*number*/ ctx[0] || "xxxx xxxx xxxx xxxx") + "";
    	let t2;
    	let t3;
    	let div7;
    	let div2;
    	let t5;
    	let div6;
    	let div3;
    	let t6;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t10;
    	let t11;
    	let div8;
    	let t12_value = (/*owner*/ ctx[1] || "Your Name") + "";
    	let t12;
    	let div9_class_value;
    	let t13;
    	let div12;
    	let div10;
    	let t15;
    	let div11;
    	let t16;
    	let div12_class_value;
    	let current;
    	const visa = new Visa({ $$inline: true });
    	const chip = new Chip({ $$inline: true });

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div9 = element("div");
    			div0 = element("div");
    			create_component(visa.$$.fragment);
    			t0 = space();
    			create_component(chip.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div7 = element("div");
    			div2 = element("div");
    			div2.textContent = "Valid Until";
    			t5 = space();
    			div6 = element("div");
    			div3 = element("div");
    			t6 = text(/*validUntilMonth*/ ctx[2]);
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "/";
    			t9 = space();
    			div5 = element("div");
    			t10 = text(/*validUntilYear*/ ctx[3]);
    			t11 = space();
    			div8 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			div12 = element("div");
    			div10 = element("div");
    			div10.textContent = "CCV Code";
    			t15 = space();
    			div11 = element("div");
    			t16 = text(/*cvv*/ ctx[4]);
    			attr_dev(div0, "class", "creditcard__type svelte-1p60ply");
    			add_location(div0, file$2, 131, 4, 3117);
    			attr_dev(div1, "class", "creditcard__number svelte-1p60ply");
    			add_location(div1, file$2, 133, 4, 3177);
    			attr_dev(div2, "class", "creditcard__valid-until-text svelte-1p60ply");
    			add_location(div2, file$2, 137, 6, 3309);
    			attr_dev(div3, "class", "svelte-1p60ply");
    			add_location(div3, file$2, 141, 8, 3442);
    			attr_dev(div4, "class", "svelte-1p60ply");
    			add_location(div4, file$2, 142, 8, 3479);
    			attr_dev(div5, "class", "svelte-1p60ply");
    			add_location(div5, file$2, 143, 8, 3500);
    			attr_dev(div6, "class", "creditcard__valid-until-date svelte-1p60ply");
    			add_location(div6, file$2, 140, 6, 3391);
    			attr_dev(div7, "class", "creditcard__valid-until svelte-1p60ply");
    			add_location(div7, file$2, 136, 4, 3265);
    			attr_dev(div8, "class", "creditcard__owner svelte-1p60ply");
    			add_location(div8, file$2, 146, 4, 3556);

    			attr_dev(div9, "class", div9_class_value = "creditcard " + (/*isBack*/ ctx[5]
    			? "creditcard--hidden"
    			: "creditcard--front fade-in") + " svelte-1p60ply");

    			add_location(div9, file$2, 130, 2, 3026);
    			attr_dev(div10, "class", "creditcard__cvv-text svelte-1p60ply");
    			add_location(div10, file$2, 151, 4, 3729);
    			attr_dev(div11, "class", "creditcard__cvv svelte-1p60ply");
    			add_location(div11, file$2, 152, 4, 3782);

    			attr_dev(div12, "class", div12_class_value = "creditcard " + (/*isBack*/ ctx[5]
    			? "creditcard--back fade-in"
    			: "creditcard--hidden") + " svelte-1p60ply");

    			add_location(div12, file$2, 150, 2, 3639);
    			attr_dev(div13, "class", "creditcard__wrapper svelte-1p60ply");
    			add_location(div13, file$2, 129, 0, 2990);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div9);
    			append_dev(div9, div0);
    			mount_component(visa, div0, null);
    			append_dev(div9, t0);
    			mount_component(chip, div9, null);
    			append_dev(div9, t1);
    			append_dev(div9, div1);
    			append_dev(div1, t2);
    			append_dev(div9, t3);
    			append_dev(div9, div7);
    			append_dev(div7, div2);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, t10);
    			append_dev(div9, t11);
    			append_dev(div9, div8);
    			append_dev(div8, t12);
    			append_dev(div13, t13);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div12, t15);
    			append_dev(div12, div11);
    			append_dev(div11, t16);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*number*/ 1) && t2_value !== (t2_value = (/*number*/ ctx[0] || "xxxx xxxx xxxx xxxx") + "")) set_data_dev(t2, t2_value);
    			if (!current || dirty & /*validUntilMonth*/ 4) set_data_dev(t6, /*validUntilMonth*/ ctx[2]);
    			if (!current || dirty & /*validUntilYear*/ 8) set_data_dev(t10, /*validUntilYear*/ ctx[3]);
    			if ((!current || dirty & /*owner*/ 2) && t12_value !== (t12_value = (/*owner*/ ctx[1] || "Your Name") + "")) set_data_dev(t12, t12_value);

    			if (!current || dirty & /*isBack*/ 32 && div9_class_value !== (div9_class_value = "creditcard " + (/*isBack*/ ctx[5]
    			? "creditcard--hidden"
    			: "creditcard--front fade-in") + " svelte-1p60ply")) {
    				attr_dev(div9, "class", div9_class_value);
    			}

    			if (!current || dirty & /*cvv*/ 16) set_data_dev(t16, /*cvv*/ ctx[4]);

    			if (!current || dirty & /*isBack*/ 32 && div12_class_value !== (div12_class_value = "creditcard " + (/*isBack*/ ctx[5]
    			? "creditcard--back fade-in"
    			: "creditcard--hidden") + " svelte-1p60ply")) {
    				attr_dev(div12, "class", div12_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(visa.$$.fragment, local);
    			transition_in(chip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(visa.$$.fragment, local);
    			transition_out(chip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			destroy_component(visa);
    			destroy_component(chip);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { number } = $$props;
    	let { owner } = $$props;
    	let { validUntilMonth } = $$props;
    	let { validUntilYear } = $$props;
    	let { cvv } = $$props;
    	let { isBack } = $$props;
    	const writable_props = ["number", "owner", "validUntilMonth", "validUntilYear", "cvv", "isBack"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Creditcard> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("owner" in $$props) $$invalidate(1, owner = $$props.owner);
    		if ("validUntilMonth" in $$props) $$invalidate(2, validUntilMonth = $$props.validUntilMonth);
    		if ("validUntilYear" in $$props) $$invalidate(3, validUntilYear = $$props.validUntilYear);
    		if ("cvv" in $$props) $$invalidate(4, cvv = $$props.cvv);
    		if ("isBack" in $$props) $$invalidate(5, isBack = $$props.isBack);
    	};

    	$$self.$capture_state = () => ({
    		Visa,
    		Chip,
    		number,
    		owner,
    		validUntilMonth,
    		validUntilYear,
    		cvv,
    		isBack
    	});

    	$$self.$inject_state = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("owner" in $$props) $$invalidate(1, owner = $$props.owner);
    		if ("validUntilMonth" in $$props) $$invalidate(2, validUntilMonth = $$props.validUntilMonth);
    		if ("validUntilYear" in $$props) $$invalidate(3, validUntilYear = $$props.validUntilYear);
    		if ("cvv" in $$props) $$invalidate(4, cvv = $$props.cvv);
    		if ("isBack" in $$props) $$invalidate(5, isBack = $$props.isBack);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [number, owner, validUntilMonth, validUntilYear, cvv, isBack];
    }

    class Creditcard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment$2, safe_not_equal, {
    			number: 0,
    			owner: 1,
    			validUntilMonth: 2,
    			validUntilYear: 3,
    			cvv: 4,
    			isBack: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Creditcard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*number*/ ctx[0] === undefined && !("number" in props)) {
    			console.warn("<Creditcard> was created without expected prop 'number'");
    		}

    		if (/*owner*/ ctx[1] === undefined && !("owner" in props)) {
    			console.warn("<Creditcard> was created without expected prop 'owner'");
    		}

    		if (/*validUntilMonth*/ ctx[2] === undefined && !("validUntilMonth" in props)) {
    			console.warn("<Creditcard> was created without expected prop 'validUntilMonth'");
    		}

    		if (/*validUntilYear*/ ctx[3] === undefined && !("validUntilYear" in props)) {
    			console.warn("<Creditcard> was created without expected prop 'validUntilYear'");
    		}

    		if (/*cvv*/ ctx[4] === undefined && !("cvv" in props)) {
    			console.warn("<Creditcard> was created without expected prop 'cvv'");
    		}

    		if (/*isBack*/ ctx[5] === undefined && !("isBack" in props)) {
    			console.warn("<Creditcard> was created without expected prop 'isBack'");
    		}
    	}

    	get number() {
    		throw new Error("<Creditcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Creditcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get owner() {
    		throw new Error("<Creditcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set owner(value) {
    		throw new Error("<Creditcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validUntilMonth() {
    		throw new Error("<Creditcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validUntilMonth(value) {
    		throw new Error("<Creditcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validUntilYear() {
    		throw new Error("<Creditcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validUntilYear(value) {
    		throw new Error("<Creditcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cvv() {
    		throw new Error("<Creditcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cvv(value) {
    		throw new Error("<Creditcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isBack() {
    		throw new Error("<Creditcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isBack(value) {
    		throw new Error("<Creditcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CreditcardForm.svelte generated by Svelte v3.19.1 */

    const file$3 = "src/CreditcardForm.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (129:12) {:else}
    function create_else_block(ctx) {
    	let option;
    	let t_value = /*month*/ ctx[17] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*month*/ ctx[17];
    			option.value = option.__value;
    			add_location(option, file$3, 129, 14, 3758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*months*/ 16 && t_value !== (t_value = /*month*/ ctx[17] + "")) set_data_dev(t, t_value);

    			if (dirty & /*months*/ 16 && option_value_value !== (option_value_value = /*month*/ ctx[17])) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(129:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (127:12) {#if month == prop.validUntilMonth}
    function create_if_block(ctx) {
    	let option;
    	let t_value = /*month*/ ctx[17] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*month*/ ctx[17];
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$3, 127, 14, 3674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*months*/ 16 && t_value !== (t_value = /*month*/ ctx[17] + "")) set_data_dev(t, t_value);

    			if (dirty & /*months*/ 16 && option_value_value !== (option_value_value = /*month*/ ctx[17])) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(127:12) {#if month == prop.validUntilMonth}",
    		ctx
    	});

    	return block;
    }

    // (126:10) {#each months as month}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*month*/ ctx[17] == /*prop*/ ctx[0].validUntilMonth) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(126:10) {#each months as month}",
    		ctx
    	});

    	return block;
    }

    // (141:10) {#each years as year}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*year*/ ctx[14] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*year*/ ctx[14];
    			option.value = option.__value;
    			add_location(option, file$3, 141, 12, 4265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*years*/ 8 && t_value !== (t_value = /*year*/ ctx[14] + "")) set_data_dev(t, t_value);

    			if (dirty & /*years*/ 8 && option_value_value !== (option_value_value = /*year*/ ctx[14])) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(141:10) {#each years as year}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let form;
    	let div6;
    	let p;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div5;
    	let div2;
    	let label2;
    	let t9;
    	let select0;
    	let option0;
    	let t11;
    	let div3;
    	let label3;
    	let t13;
    	let select1;
    	let option1;
    	let t15;
    	let div4;
    	let label4;
    	let t17;
    	let input2;
    	let t18;
    	let button;
    	let dispose;
    	let each_value_1 = /*months*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*years*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			div6 = element("div");
    			p = element("p");
    			p.textContent = "Please enter your credit card data";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Card Number";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Owner";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div5 = element("div");
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Exp. Month";
    			t9 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "-";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t11 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Exp. Year";
    			t13 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "CVV";
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(p, "class", "creditcard-form__info svelte-1mi57pe");
    			add_location(p, file$3, 104, 4, 2572);
    			attr_dev(label0, "for", "cc-number");
    			attr_dev(label0, "class", "creditcard-form__label svelte-1mi57pe");
    			add_location(label0, file$3, 108, 6, 2703);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "cc-number");
    			attr_dev(input0, "class", "creditcard-form__input svelte-1mi57pe");
    			input0.required = true;
    			attr_dev(input0, "maxlength", "19");
    			add_location(input0, file$3, 109, 6, 2783);
    			attr_dev(div0, "class", "creditcard-form__group svelte-1mi57pe");
    			add_location(div0, file$3, 107, 4, 2660);
    			attr_dev(label1, "for", "cc-owner");
    			attr_dev(label1, "class", "creditcard-form__label svelte-1mi57pe");
    			add_location(label1, file$3, 116, 6, 3043);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "cc-owner");
    			attr_dev(input1, "class", "creditcard-form__input svelte-1mi57pe");
    			input1.required = true;
    			add_location(input1, file$3, 117, 6, 3116);
    			attr_dev(div1, "class", "creditcard-form__group svelte-1mi57pe");
    			add_location(div1, file$3, 115, 4, 3000);
    			attr_dev(label2, "for", "cc-valid-until-month");
    			attr_dev(label2, "class", "creditcard-form__label svelte-1mi57pe");
    			add_location(label2, file$3, 122, 8, 3320);
    			option0.__value = "";
    			option0.value = option0.__value;
    			option0.selected = true;
    			option0.disabled = true;
    			option0.hidden = true;
    			add_location(option0, file$3, 124, 10, 3525);
    			attr_dev(select0, "id", "cc-valid-until-month");
    			attr_dev(select0, "class", "creditcard-form__select svelte-1mi57pe");
    			if (/*prop*/ ctx[0].validUntilMonth === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[11].call(select0));
    			add_location(select0, file$3, 123, 8, 3412);
    			attr_dev(div2, "class", "creditcard-form__group svelte-1mi57pe");
    			add_location(div2, file$3, 121, 6, 3275);
    			attr_dev(label3, "for", "cc-valid-until-year");
    			attr_dev(label3, "class", "creditcard-form__label svelte-1mi57pe");
    			add_location(label3, file$3, 135, 8, 3918);
    			option1.__value = "";
    			option1.value = option1.__value;
    			option1.selected = true;
    			option1.disabled = true;
    			option1.hidden = true;
    			add_location(option1, file$3, 139, 10, 4168);
    			attr_dev(select1, "id", "cc-valid-until-year");
    			attr_dev(select1, "class", "creditcard-form__select svelte-1mi57pe");
    			if (/*prop*/ ctx[0].validUntilYear === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[12].call(select1));
    			add_location(select1, file$3, 136, 8, 4008);
    			attr_dev(div3, "class", "creditcard-form__group svelte-1mi57pe");
    			add_location(div3, file$3, 134, 6, 3873);
    			attr_dev(label4, "for", "cc-cvv");
    			attr_dev(label4, "class", "creditcard-form__label svelte-1mi57pe");
    			add_location(label4, file$3, 146, 8, 4404);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "cc-cvv");
    			attr_dev(input2, "class", "creditcard-form__input svelte-1mi57pe");
    			input2.required = true;
    			attr_dev(input2, "maxlength", "4");
    			attr_dev(input2, "minlength", "3");
    			add_location(input2, file$3, 147, 8, 4475);
    			attr_dev(div4, "class", "creditcard-form__group svelte-1mi57pe");
    			add_location(div4, file$3, 145, 6, 4359);
    			attr_dev(div5, "class", "creditcard-form__row svelte-1mi57pe");
    			add_location(div5, file$3, 120, 4, 3234);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "creditcard-form__submit svelte-1mi57pe");
    			add_location(button, file$3, 154, 4, 4767);
    			attr_dev(div6, "class", "creditcard-form");
    			add_location(div6, file$3, 103, 2, 2538);
    			add_location(form, file$3, 102, 0, 2489);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div6);
    			append_dev(div6, p);
    			append_dev(div6, t1);
    			append_dev(div6, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*prop*/ ctx[0].number);
    			append_dev(div6, t4);
    			append_dev(div6, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*prop*/ ctx[0].owner);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*prop*/ ctx[0].validUntilMonth);
    			append_dev(div5, t11);
    			append_dev(div5, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t13);
    			append_dev(div3, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*prop*/ ctx[0].validUntilYear);
    			append_dev(div5, t15);
    			append_dev(div5, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t17);
    			append_dev(div4, input2);
    			set_input_value(input2, /*prop*/ ctx[0].cvv);
    			append_dev(div6, t18);
    			append_dev(div6, button);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    				listen_dev(input0, "keypress", validateNumber, false, false, false),
    				listen_dev(input0, "keyup", handleNumberInput, false, false, false),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    				listen_dev(select0, "change", /*select0_change_handler*/ ctx[11]),
    				listen_dev(select1, "change", /*select1_change_handler*/ ctx[12]),
    				listen_dev(select1, "change", /*handleYearChange*/ ctx[5], false, false, false),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    				listen_dev(
    					input2,
    					"focus",
    					function () {
    						if (is_function(/*toggleCreditcardHandler*/ ctx[2])) /*toggleCreditcardHandler*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(input2, "keypress", validateNumber, false, false, false),
    				listen_dev(
    					input2,
    					"blur",
    					function () {
    						if (is_function(/*toggleCreditcardHandler*/ ctx[2])) /*toggleCreditcardHandler*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(
    					form,
    					"submit",
    					prevent_default(function () {
    						if (is_function(/*handleSubmit*/ ctx[1])) /*handleSubmit*/ ctx[1].apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				)
    			];
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*prop*/ 1 && input0.value !== /*prop*/ ctx[0].number) {
    				set_input_value(input0, /*prop*/ ctx[0].number);
    			}

    			if (dirty & /*prop*/ 1 && input1.value !== /*prop*/ ctx[0].owner) {
    				set_input_value(input1, /*prop*/ ctx[0].owner);
    			}

    			if (dirty & /*months, prop*/ 17) {
    				each_value_1 = /*months*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*prop*/ 1) {
    				select_option(select0, /*prop*/ ctx[0].validUntilMonth);
    			}

    			if (dirty & /*years*/ 8) {
    				each_value = /*years*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*prop*/ 1) {
    				select_option(select1, /*prop*/ ctx[0].validUntilYear);
    			}

    			if (dirty & /*prop*/ 1 && input2.value !== /*prop*/ ctx[0].cvv) {
    				set_input_value(input2, /*prop*/ ctx[0].cvv);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleNumberInput(event) {
    	event.target.value = event.target.value.replace(/(\d{4})(\d+)/g, "$1 $2");
    }

    function validateNumber() {
    	var key = window.event ? event.keyCode : event.which;

    	if (event.keyCode === 8 || event.keyCode === 46) {
    		return true;
    	} else if (key < 48 || key > 57) {
    		event.preventDefault();
    	} else {
    		return true;
    	}
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { prop } = $$props;
    	let { handleSubmit } = $$props;
    	let { toggleCreditcardHandler } = $$props;
    	const currMonth = new Date().getMonth();
    	const currYear = parseInt(new Date().getFullYear().toString().slice(2));
    	let years = [currYear];
    	let months = [];

    	for (let i = 1; i < 9; i++) {
    		years.push(currYear + i);
    	}

    	// parse back to string since month is also a string
    	years = years.map(year => year.toString());

    	function setMonths(inFuture) {
    		$$invalidate(4, months = []);

    		for (let i = 0; i < 12; i++) {
    			if (i > currMonth || inFuture) {
    				const m = i + 1;
    				months.push(m < 10 ? `0${m}` : m);
    			}
    		}
    	}

    	setMonths();

    	function handleYearChange(event) {
    		if (parseInt(event.target.value) !== currYear) {
    			setMonths(true);
    		} else {
    			setMonths();
    		}
    	}

    	const writable_props = ["prop", "handleSubmit", "toggleCreditcardHandler"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CreditcardForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		prop.number = this.value;
    		$$invalidate(0, prop);
    		$$invalidate(4, months);
    	}

    	function input1_input_handler() {
    		prop.owner = this.value;
    		$$invalidate(0, prop);
    		$$invalidate(4, months);
    	}

    	function select0_change_handler() {
    		prop.validUntilMonth = select_value(this);
    		$$invalidate(0, prop);
    		$$invalidate(4, months);
    	}

    	function select1_change_handler() {
    		prop.validUntilYear = select_value(this);
    		$$invalidate(0, prop);
    		$$invalidate(4, months);
    	}

    	function input2_input_handler() {
    		prop.cvv = this.value;
    		$$invalidate(0, prop);
    		$$invalidate(4, months);
    	}

    	$$self.$set = $$props => {
    		if ("prop" in $$props) $$invalidate(0, prop = $$props.prop);
    		if ("handleSubmit" in $$props) $$invalidate(1, handleSubmit = $$props.handleSubmit);
    		if ("toggleCreditcardHandler" in $$props) $$invalidate(2, toggleCreditcardHandler = $$props.toggleCreditcardHandler);
    	};

    	$$self.$capture_state = () => ({
    		prop,
    		handleSubmit,
    		toggleCreditcardHandler,
    		currMonth,
    		currYear,
    		years,
    		months,
    		setMonths,
    		handleYearChange,
    		handleNumberInput,
    		validateNumber,
    		Date,
    		parseInt,
    		window,
    		event
    	});

    	$$self.$inject_state = $$props => {
    		if ("prop" in $$props) $$invalidate(0, prop = $$props.prop);
    		if ("handleSubmit" in $$props) $$invalidate(1, handleSubmit = $$props.handleSubmit);
    		if ("toggleCreditcardHandler" in $$props) $$invalidate(2, toggleCreditcardHandler = $$props.toggleCreditcardHandler);
    		if ("years" in $$props) $$invalidate(3, years = $$props.years);
    		if ("months" in $$props) $$invalidate(4, months = $$props.months);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		prop,
    		handleSubmit,
    		toggleCreditcardHandler,
    		years,
    		months,
    		handleYearChange,
    		currMonth,
    		currYear,
    		setMonths,
    		input0_input_handler,
    		input1_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input2_input_handler
    	];
    }

    class CreditcardForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$3, safe_not_equal, {
    			prop: 0,
    			handleSubmit: 1,
    			toggleCreditcardHandler: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreditcardForm",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*prop*/ ctx[0] === undefined && !("prop" in props)) {
    			console.warn("<CreditcardForm> was created without expected prop 'prop'");
    		}

    		if (/*handleSubmit*/ ctx[1] === undefined && !("handleSubmit" in props)) {
    			console.warn("<CreditcardForm> was created without expected prop 'handleSubmit'");
    		}

    		if (/*toggleCreditcardHandler*/ ctx[2] === undefined && !("toggleCreditcardHandler" in props)) {
    			console.warn("<CreditcardForm> was created without expected prop 'toggleCreditcardHandler'");
    		}
    	}

    	get prop() {
    		throw new Error("<CreditcardForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prop(value) {
    		throw new Error("<CreditcardForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleSubmit() {
    		throw new Error("<CreditcardForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleSubmit(value) {
    		throw new Error("<CreditcardForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleCreditcardHandler() {
    		throw new Error("<CreditcardForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleCreditcardHandler(value) {
    		throw new Error("<CreditcardForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Modal.svelte generated by Svelte v3.19.1 */

    const file$4 = "src/Modal.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let h3;
    	let t3;
    	let p0;
    	let t4;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8;
    	let t9;
    	let p2;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let p3;
    	let t15;
    	let t16;
    	let div1_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "The following data was submitted";
    			t3 = space();
    			p0 = element("p");
    			t4 = text("Number: ");
    			t5 = text(/*number*/ ctx[0]);
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Owner: ");
    			t8 = text(/*owner*/ ctx[1]);
    			t9 = space();
    			p2 = element("p");
    			t10 = text("Valid Until: ");
    			t11 = text(/*validUntilMonth*/ ctx[2]);
    			t12 = text("/");
    			t13 = text(/*validUntilYear*/ ctx[3]);
    			t14 = space();
    			p3 = element("p");
    			t15 = text("CVV: ");
    			t16 = text(/*cvv*/ ctx[4]);
    			attr_dev(span, "class", "modal__close svelte-1jlw9xt");
    			add_location(span, file$4, 57, 4, 1314);
    			attr_dev(h3, "class", "modal__title svelte-1jlw9xt");
    			add_location(h3, file$4, 58, 4, 1388);
    			attr_dev(p0, "class", "modal__paragraph svelte-1jlw9xt");
    			add_location(p0, file$4, 59, 4, 1455);
    			attr_dev(p1, "class", "modal__paragraph svelte-1jlw9xt");
    			add_location(p1, file$4, 60, 4, 1508);
    			attr_dev(p2, "class", "modal__paragraph svelte-1jlw9xt");
    			add_location(p2, file$4, 61, 4, 1559);
    			attr_dev(p3, "class", "modal__paragraph svelte-1jlw9xt");
    			add_location(p3, file$4, 64, 4, 1655);
    			attr_dev(div0, "class", "modal__content svelte-1jlw9xt");
    			add_location(div0, file$4, 56, 2, 1281);

    			attr_dev(div1, "class", div1_class_value = "modal " + (/*showModal*/ ctx[5]
    			? "modal--visible"
    			: "modal--hidden") + " svelte-1jlw9xt");

    			add_location(div1, file$4, 55, 0, 1210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t1);
    			append_dev(div0, h3);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div0, t9);
    			append_dev(div0, p2);
    			append_dev(p2, t10);
    			append_dev(p2, t11);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(div0, t14);
    			append_dev(div0, p3);
    			append_dev(p3, t15);
    			append_dev(p3, t16);

    			dispose = listen_dev(
    				span,
    				"click",
    				function () {
    					if (is_function(/*handleCloseModal*/ ctx[6])) /*handleCloseModal*/ ctx[6].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*number*/ 1) set_data_dev(t5, /*number*/ ctx[0]);
    			if (dirty & /*owner*/ 2) set_data_dev(t8, /*owner*/ ctx[1]);
    			if (dirty & /*validUntilMonth*/ 4) set_data_dev(t11, /*validUntilMonth*/ ctx[2]);
    			if (dirty & /*validUntilYear*/ 8) set_data_dev(t13, /*validUntilYear*/ ctx[3]);
    			if (dirty & /*cvv*/ 16) set_data_dev(t16, /*cvv*/ ctx[4]);

    			if (dirty & /*showModal*/ 32 && div1_class_value !== (div1_class_value = "modal " + (/*showModal*/ ctx[5]
    			? "modal--visible"
    			: "modal--hidden") + " svelte-1jlw9xt")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { number } = $$props;
    	let { owner } = $$props;
    	let { validUntilMonth } = $$props;
    	let { validUntilYear } = $$props;
    	let { cvv } = $$props;
    	let { isBack } = $$props;
    	let { showModal } = $$props;
    	let { handleCloseModal } = $$props;

    	const writable_props = [
    		"number",
    		"owner",
    		"validUntilMonth",
    		"validUntilYear",
    		"cvv",
    		"isBack",
    		"showModal",
    		"handleCloseModal"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("owner" in $$props) $$invalidate(1, owner = $$props.owner);
    		if ("validUntilMonth" in $$props) $$invalidate(2, validUntilMonth = $$props.validUntilMonth);
    		if ("validUntilYear" in $$props) $$invalidate(3, validUntilYear = $$props.validUntilYear);
    		if ("cvv" in $$props) $$invalidate(4, cvv = $$props.cvv);
    		if ("isBack" in $$props) $$invalidate(7, isBack = $$props.isBack);
    		if ("showModal" in $$props) $$invalidate(5, showModal = $$props.showModal);
    		if ("handleCloseModal" in $$props) $$invalidate(6, handleCloseModal = $$props.handleCloseModal);
    	};

    	$$self.$capture_state = () => ({
    		number,
    		owner,
    		validUntilMonth,
    		validUntilYear,
    		cvv,
    		isBack,
    		showModal,
    		handleCloseModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("owner" in $$props) $$invalidate(1, owner = $$props.owner);
    		if ("validUntilMonth" in $$props) $$invalidate(2, validUntilMonth = $$props.validUntilMonth);
    		if ("validUntilYear" in $$props) $$invalidate(3, validUntilYear = $$props.validUntilYear);
    		if ("cvv" in $$props) $$invalidate(4, cvv = $$props.cvv);
    		if ("isBack" in $$props) $$invalidate(7, isBack = $$props.isBack);
    		if ("showModal" in $$props) $$invalidate(5, showModal = $$props.showModal);
    		if ("handleCloseModal" in $$props) $$invalidate(6, handleCloseModal = $$props.handleCloseModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		number,
    		owner,
    		validUntilMonth,
    		validUntilYear,
    		cvv,
    		showModal,
    		handleCloseModal,
    		isBack
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$4, safe_not_equal, {
    			number: 0,
    			owner: 1,
    			validUntilMonth: 2,
    			validUntilYear: 3,
    			cvv: 4,
    			isBack: 7,
    			showModal: 5,
    			handleCloseModal: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*number*/ ctx[0] === undefined && !("number" in props)) {
    			console.warn("<Modal> was created without expected prop 'number'");
    		}

    		if (/*owner*/ ctx[1] === undefined && !("owner" in props)) {
    			console.warn("<Modal> was created without expected prop 'owner'");
    		}

    		if (/*validUntilMonth*/ ctx[2] === undefined && !("validUntilMonth" in props)) {
    			console.warn("<Modal> was created without expected prop 'validUntilMonth'");
    		}

    		if (/*validUntilYear*/ ctx[3] === undefined && !("validUntilYear" in props)) {
    			console.warn("<Modal> was created without expected prop 'validUntilYear'");
    		}

    		if (/*cvv*/ ctx[4] === undefined && !("cvv" in props)) {
    			console.warn("<Modal> was created without expected prop 'cvv'");
    		}

    		if (/*isBack*/ ctx[7] === undefined && !("isBack" in props)) {
    			console.warn("<Modal> was created without expected prop 'isBack'");
    		}

    		if (/*showModal*/ ctx[5] === undefined && !("showModal" in props)) {
    			console.warn("<Modal> was created without expected prop 'showModal'");
    		}

    		if (/*handleCloseModal*/ ctx[6] === undefined && !("handleCloseModal" in props)) {
    			console.warn("<Modal> was created without expected prop 'handleCloseModal'");
    		}
    	}

    	get number() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get owner() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set owner(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validUntilMonth() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validUntilMonth(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validUntilYear() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validUntilYear(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cvv() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cvv(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isBack() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isBack(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleCloseModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleCloseModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.1 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let updating_prop;
    	let t3;
    	let current;
    	const creditcard_spread_levels = [/*creditcardData*/ ctx[1]];
    	let creditcard_props = {};

    	for (let i = 0; i < creditcard_spread_levels.length; i += 1) {
    		creditcard_props = assign(creditcard_props, creditcard_spread_levels[i]);
    	}

    	const creditcard = new Creditcard({ props: creditcard_props, $$inline: true });

    	function creditcardform_prop_binding(value) {
    		/*creditcardform_prop_binding*/ ctx[6].call(null, value);
    	}

    	let creditcardform_props = {
    		handleSubmit: /*handleSubmit*/ ctx[2],
    		toggleCreditcardHandler: /*toggleCreditcardHandler*/ ctx[3]
    	};

    	if (/*creditcardData*/ ctx[1] !== void 0) {
    		creditcardform_props.prop = /*creditcardData*/ ctx[1];
    	}

    	const creditcardform = new CreditcardForm({
    			props: creditcardform_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(creditcardform, "prop", creditcardform_prop_binding));

    	const modal_spread_levels = [
    		/*creditcardData*/ ctx[1],
    		{ showModal: /*showModal*/ ctx[0] },
    		{
    			handleCloseModal: /*handleCloseModal*/ ctx[4]
    		}
    	];

    	let modal_props = {};

    	for (let i = 0; i < modal_spread_levels.length; i += 1) {
    		modal_props = assign(modal_props, modal_spread_levels[i]);
    	}

    	const modal = new Modal({ props: modal_props, $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(creditcard.$$.fragment);
    			t2 = space();
    			create_component(creditcardform.$$.fragment);
    			t3 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css?family=Share+Tech+Mono&display=swap");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$5, 0, 0, 0);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Hind&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file$5, 1, 0, 100);
    			attr_dev(div0, "class", "container svelte-1yx98hx");
    			add_location(div0, file$5, 50, 1, 1135);
    			attr_dev(div1, "class", "wrapper svelte-1yx98hx");
    			add_location(div1, file$5, 48, 0, 1111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(creditcard, div0, null);
    			append_dev(div0, t2);
    			mount_component(creditcardform, div0, null);
    			insert_dev(target, t3, anchor);
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const creditcard_changes = (dirty & /*creditcardData*/ 2)
    			? get_spread_update(creditcard_spread_levels, [get_spread_object(/*creditcardData*/ ctx[1])])
    			: {};

    			creditcard.$set(creditcard_changes);
    			const creditcardform_changes = {};

    			if (!updating_prop && dirty & /*creditcardData*/ 2) {
    				updating_prop = true;
    				creditcardform_changes.prop = /*creditcardData*/ ctx[1];
    				add_flush_callback(() => updating_prop = false);
    			}

    			creditcardform.$set(creditcardform_changes);

    			const modal_changes = (dirty & /*creditcardData, showModal, handleCloseModal*/ 19)
    			? get_spread_update(modal_spread_levels, [
    					dirty & /*creditcardData*/ 2 && get_spread_object(/*creditcardData*/ ctx[1]),
    					dirty & /*showModal*/ 1 && { showModal: /*showModal*/ ctx[0] },
    					dirty & /*handleCloseModal*/ 16 && {
    						handleCloseModal: /*handleCloseModal*/ ctx[4]
    					}
    				])
    			: {};

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(creditcard.$$.fragment, local);
    			transition_in(creditcardform.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(creditcard.$$.fragment, local);
    			transition_out(creditcardform.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(creditcard);
    			destroy_component(creditcardform);
    			if (detaching) detach_dev(t3);
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let showModal = false;

    	let initialCreditcardData = {
    		owner: "",
    		number: "",
    		cvv: "",
    		validUntilMonth: "",
    		validUntilYear: "",
    		isBack: false
    	};

    	let creditcardData = { ...initialCreditcardData };

    	function handleSubmit() {
    		$$invalidate(0, showModal = true);
    	}

    	function toggleCreditcardHandler() {
    		$$invalidate(1, creditcardData.isBack = !creditcardData.isBack, creditcardData);
    	}

    	function handleCloseModal() {
    		$$invalidate(0, showModal = false);
    		$$invalidate(1, creditcardData = initialCreditcardData);
    	}

    	function creditcardform_prop_binding(value) {
    		creditcardData = value;
    		$$invalidate(1, creditcardData);
    	}

    	$$self.$capture_state = () => ({
    		Creditcard,
    		CreditcardForm,
    		Modal,
    		showModal,
    		initialCreditcardData,
    		creditcardData,
    		handleSubmit,
    		toggleCreditcardHandler,
    		handleCloseModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("initialCreditcardData" in $$props) initialCreditcardData = $$props.initialCreditcardData;
    		if ("creditcardData" in $$props) $$invalidate(1, creditcardData = $$props.creditcardData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		creditcardData,
    		handleSubmit,
    		toggleCreditcardHandler,
    		handleCloseModal,
    		initialCreditcardData,
    		creditcardform_prop_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
