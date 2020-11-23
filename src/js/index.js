import anime from './lib/anime.es.js';

class PanelDirector {
    constructor() {
        this.current_panel = null;
        this.overlayed_panel = null;
    }

    renderPanel(panel) {
        if (this.current_panel) {
            // Hide current panel
            this.clearPanel();
        }

        // Change current panel to the panel given to render
        this.current_panel = panel;

        // Display the panel
        this.current_panel.display();
    }

    clearPanel() {
        if (this.overlayed_panel) {
            this.clearOverlayPanel();
        } else if (this.current_panel) {
            // Hide current panel
            this.current_panel.hide();
            this.current_panel = null;
        }
    }

    overlayPanel(overlaying_panel) {
        // Set current panel to overlayed
        this.overlayed_panel = this.current_panel;
        this.overlayed_panel.hidePanel();
        
        // Display overlaying_panel
        this.current_panel = overlaying_panel;
        this.current_panel.displayPanel();
    }

    clearOverlayPanel() {
        this.current_panel.hidePanel();

        this.current_panel = this.overlayed_panel;
        this.overlayed_panel = null;
    }

    loadProjectPanel(project_name) {
        console.log(project_name);

        // Check if project name matches regular expression
        if (/#projects-(\d{4})-(\w+)/.test(project_name)) {
            // Fetch project dynamically 
            const project_panel = new Panel(document.getElementById('project-panel'))
            const project_url = project_name.slice(1).replaceAll('-','/');
            const URL = `${window.location.origin}/${project_url}.html`;
            
            // Overlay panel - TODO add loading screen
            this.overlayPanel(project_panel);

            // Fetch content and once we get content, inject HTML
            fetch(URL)
                .then((res) => res.text())
                .then((text) => {
                    const parser = new DOMParser();
                    const html = parser.parseFromString(text, 'text/html');
                    console.log(this.current_panel.root_element);
                    this.current_panel.injectHtml(html.body.innerHTML);
                });
        }
    }
}

class Panel {
    constructor(html_element, html_link) {
        this.root_element = html_element;
        // Assume each link element has a single child
        this.link_element = html_link;
        this.onRenderAnimation = null;
    }

    display() {
        this.root_element.style.display = "block";
        if (this.link_element) {
            // Style from index.css { a.content-link:focus * }
            this.link_element.children[0].style = "transform: scale(1.06, 1.06);opacity: 1;text-decoration: underline;"
        }
        if (this.onRenderAnimation) {
            this.onRenderAnimation.restart();
        }
    }

    displayPanel() {
        this.root_element.style.display = "block";
        if (this.onRenderAnimation) {
            this.onRenderAnimation.restart();
        }
    }

    hide() {
        this.root_element.style.display = "none";
        if (this.link_element) {
            this.link_element.children[0].style = "";
        }
    }

    hidePanel() {
        this.root_element.style.display = "none";
    }

    injectHtml(html) {
        console.log(this.root_element.querySelector('.panel-content'));
        this.root_element.querySelector('.panel-content').innerHTML = html;
    }
}

const panel_context = new PanelDirector();

// Set up content-links onclick funcitonality 
window.onload = () => {
    // After 30 seconds, render CTA message
    setTimeout(renderCTAMessage, 30000);

    // Init the page functionality
    const experience_link = document.getElementById('experience-link');
    const portfolio_link = document.getElementById('portfolio-link');
    const name_link = document.getElementById('name-link');
    const blog_link = document.getElementById('blog-link');
    const contact_link = document.getElementById('contact-link');
    const cta_link = document.getElementById('cta-link');

    // Locked panel is the default for all content panels that have not been completed
    const locked_panel = new Panel(document.getElementById('locked-panel'));
    const experience_panel = new Panel(document.getElementById('experience-panel'), experience_link);
    const portfolio_panel = new Panel(document.getElementById('portfolio-panel'), portfolio_link);
    const contact_panel = new Panel(document.getElementById('contact-panel'), contact_link);

    // Add animation to panels
    const locked_panel_elements = locked_panel.root_element.querySelectorAll('.panel-content .el');
    locked_panel.onRenderAnimation = anime({
        targets: locked_panel_elements,
        opacity: 1,
        duration: 600,
        easing: 'easeInOutSine',
        delay: anime.stagger(300, {easing: 'easeOutQuad'})
    });

    const experience_panel_elements = Array.from(experience_panel.root_element.querySelectorAll('.panel-content .el'));
    experience_panel.onRenderAnimation = anime({
        targets: experience_panel_elements,
        opacity: 1,
        duration: 600,
        easing: 'easeInOutSine',
        delay: anime.stagger(300)
    });

    const contact_panel_elements = Array.from(contact_panel.root_element.querySelectorAll('.panel-content .el'));
    contact_panel.onRenderAnimation = anime.timeline({
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
    portfolio_link.onclick = () => panel_context.renderPanel(portfolio_panel);
    name_link.onclick = () => panel_context.clearPanel();
    blog_link.onclick = () => panel_context.renderPanel(locked_panel);
    contact_link.onclick = () => panel_context.renderPanel(contact_panel);
    cta_link.onclick = () => panel_context.renderPanel(contact_panel);
    
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
                portfolio_link.click();
                break;
            }
            case "#blog": {
                blog_link.click();
                break;
            }
            case "#contact": {
                contact_link.click();
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
        project_link.onclick = () => panel_context.loadProjectPanel(project_link.attributes.href.value);
    });
}