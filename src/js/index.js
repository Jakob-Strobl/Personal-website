import anime from './lib/anime.es.js';

class Panel {
    /**
     * Construct a Panel
     * @param {*} root_element The root element of the panel we want to handle 
     * @param {*} link_element (optional) The associated link element we want to style when a panel is rendered 
     */
    constructor(root_element, link_element) {
        this.root_element = root_element;
        this.link_element = link_element;

        this.onShowAnimation = null;
    }

    show(play_animation=true) {
        if (this.link_element) {
            // Style from index.css { a.content-link:focus * }
            this.link_element.style = "transform: scale(1.06, 1.06);opacity: 1;text-decoration: underline;"
        }
        if (play_animation && this.onShowAnimation) {
            this.onShowAnimation.restart();
        }
        this.root_element.style.display = "block";
    }

    hide() {
        if (this.link_element) {
            this.link_element.style = "";
        }
        this.root_element.style.display = "none";
    }
}

class DynamicPanel extends Panel { 
    /**
     * Construct a Dynamic Panel which handles asynchronous fetches for content
     * @param {*} root_element The root element of the panel we want to handle 
     * @param {*} link_element (optional) The associated link element we want to style when a panel is rendered 
     * @param {*} inject_query Query to select a child element of the root_element to inject HTML (inside the element)
     */
    constructor(root_element, link_element, inject_query) {
        super(root_element, link_element);
        this.injection_element = this.root_element.querySelector(inject_query);

        this.loading_html = `<div class="col-sm-12" style="text-align:center;"> 
                                <div class="spinner"></div>
                            </div>`;
    }

    show(play_animation=true) {
        this.injection_element.innerHTML = this.loading_html;
        super.show(play_animation);
    }

    loadContent(html) {
        if (this.root_element.style.display !== "none") {
            this.injection_element.innerHTML = html;
        } else {
            console.warn('Trying to display fetched content on a hidden root element.');
        }
    }

    hide() {
        this.injection_element.innerHTML = '';
        super.hide();
    }
}

class PanelDirector {
    constructor() {
        this.current_panel = null;
    }

    renderPanel(panel, options={}) {
        if (this.current_panel) {
            // Hide current panel
            this.current_panel.hide();
        }

        // Change current panel to the panel given to render
        this.current_panel = panel;

        // Display the panel
        this.current_panel.show(options.play_animation);
    }

    clearPanel() {
        if (this.current_panel) {
            // Hide current panel
            this.current_panel.hide();
            this.current_panel = null;
        }
    }

    renderProject(project_name) {
        console.log(project_name);

        // Check if project name matches regular expression
        if (/#projects-(\d{4})-(\w+)/.test(project_name)) {
            // Fetch project dynamically 
            const project_panel = new DynamicPanel(document.getElementById('project-panel'), this.current_panel.link_element, '.panel-content');
            const project_url = project_name.slice(1).replaceAll('-','/');
            const URL = `${window.location.origin}/${project_url}.html`;

            // Show panel
            this.renderPanel(project_panel);

            // Fetch content and once we get content, inject HTML
            fetch(URL)
                .then((res) => res.text())
                .then((text) => {
                    const parser = new DOMParser();
                    const html = parser.parseFromString(text, 'text/html');

                    // TODO remove this timeout later
                    setTimeout(() => {
                        project_panel.loadContent(html.body.innerHTML);
                    }, 1000);
                });
        }
    }
}

const panel_context = new PanelDirector();

// Set up content-links onclick funcitonality 
window.onload = () => {
    // After 30 seconds, render CTA message
    setTimeout(renderCTAMessage, 30000);

    // Init the page functionality
    const experience_link = document.getElementById('experience-link');
    const portfolio_links = document.querySelectorAll('.portfolio-link');
    const name_link = document.getElementById('name-link');
    const blog_link = document.getElementById('blog-link');
    const contact_links = document.querySelectorAll('.contact-link');


    // Locked panel is the default for all content panels that have not been completed
    const locked_panel = new Panel(document.getElementById('locked-panel'));
    const experience_panel = new Panel(document.getElementById('experience-panel'), experience_link.children[0]);
    const portfolio_panel = new Panel(document.getElementById('portfolio-panel'), portfolio_links[0].children[0]);
    const contact_panel = new Panel(document.getElementById('contact-panel'), contact_links[0].children[0]);

    // Add animation to panels
    const locked_panel_elements = locked_panel.root_element.querySelectorAll('.panel-content .el');
    locked_panel.onShowAnimation = anime({
        targets: locked_panel_elements,
        opacity: 1,
        duration: 600,
        easing: 'easeInOutSine',
        delay: anime.stagger(300, {easing: 'easeOutQuad'})
    });

    const experience_panel_elements = Array.from(experience_panel.root_element.querySelectorAll('.panel-content .el'));
    experience_panel.onShowAnimation = anime({
        targets: experience_panel_elements,
        opacity: 1,
        duration: 600,
        easing: 'easeInOutSine',
        delay: anime.stagger(300)
    });

    const contact_panel_elements = Array.from(contact_panel.root_element.querySelectorAll('.panel-content .el'));
    contact_panel.onShowAnimation = anime.timeline({
        duration: 500,
        easing: 'easeInOutSine',
    })
    .add({
        targets: contact_panel_elements[0],
        opacity: 1
    })
    .add({
        targets: contact_panel_elements.slice(1),
        opacity: 1,
        delay: anime.stagger(300)
    });

    // Set onclick functionality 
    experience_link.onclick = () => panel_context.renderPanel(experience_panel);
    portfolio_links.forEach((link) => {
        link.onclick = () => panel_context.renderPanel(portfolio_panel);
    });
    name_link.onclick = () => panel_context.clearPanel();
    blog_link.onclick = () => panel_context.renderPanel(locked_panel);
    contact_links.forEach((link) => {
        link.onclick = () => panel_context.renderPanel(contact_panel);
    });
    
    // Load panel if url_id is given
    const regex = /#\w+/i;
    const url = window.location.href;

    const url_match = url.match(regex);
    if (url_match) {
        const url_id = url_match[0];
        switch (url_id) {
            case "#experience": {
                experience_link.click();
                break;
            }
            case "#portfolio": {
                portfolio_links[0].click();
                break;
            }
            case "#blog": {
                blog_link.click();
                break;
            }
            case "#contact": {
                contact_links[0].click();
                break;
            }   
        }
    }

    // Init projects
    initProjects();
}

function renderCTAMessage() {
    function clearCTAMessage() {
        cta_message.style.display = "none";
    }

    const cta_message = document.getElementById('cta-message');
    cta_message.style.display = "inherit";

    // Get the rendered height of the message (height is computed by broswer)
    const height = cta_message.scrollHeight;
    // Set the height to a base minimum to render in
    cta_message.style.height = "1em"

    anime({
        targets: cta_message,
        opacity: 1,
        height: `${height}px`,
        duration: 1200,
        complete: () => {
            // So the browser can handle the height once 
            cta_message.style.height = "auto";
        }
    })
    .play();

    const cta_close = document.getElementById('close-cta');
    cta_close.onclick = clearCTAMessage;
}

function initProjects() {
    // Get all the project links and setup onlick functionality
    const projects = document.querySelectorAll('.project-link');
    
    projects.forEach((project_link) => {
        project_link.onclick = () => panel_context.renderProject(project_link.attributes.href.value);
    });
}