import anime from './lib/anime.es.js';

class PanelDirector {
    constructor() {
        this.current_panel = null;
    }

    renderPanel(panel) {
        if (this.current_panel) {
            // Hide current panel
            this.current_panel.hide();
        }

        // Change current panel to the panel given to render
        this.current_panel = panel;

        // Display the panel
        this.current_panel.display();
    }
}

class Panel {
    constructor(html_element, html_link) {
        this.panel_element = html_element;
        // Assume each link element has a single child
        this.link_element = html_link;
        this.onRenderAnimation = null;
    }

    display() {
        this.panel_element.style.display = "block";
        if (this.link_element) {
            // Style from index.css { a.content-link:focus * }
            this.link_element.children[0].style = "transform: scale(1.06, 1.06);opacity: 1;text-decoration: underline;"
        }
        if (this.onRenderAnimation) {
            this.onRenderAnimation.restart();
        }
    }

    hide() {
        this.panel_element.style.display = "none";
        if (this.link_element) {
            this.link_element.children[0].style = "";
        }
    }
}

const panel_context = new PanelDirector();

// Set up content-links onclick funcitonality 
window.onload = () => {
    const experience_link = document.getElementById('experience-link');
    const portfolio_link = document.getElementById('portfolio-link');
    const blog_link = document.getElementById('blog-link');
    const contact_link = document.getElementById('contact-link');

    // Locked panel is the default for all content panels that have not been completed
    const locked_panel = new Panel(document.getElementById('locked-panel'));
    const experience_panel = new Panel(document.getElementById('experience-panel'), experience_link);
    const contact_panel = new Panel(document.getElementById('contact-panel'), contact_link);

    // Add animation to panels
    const locked_panel_elements = locked_panel.panel_element.querySelectorAll('.panel-content .el');
    locked_panel.onRenderAnimation = anime({
        targets: locked_panel_elements,
        opacity: 1,
        duration: 600,
        easing: 'easeInOutSine',
        delay: anime.stagger(500, {easing: 'easeOutQuad'})
    });

    const contact_panel_elements = Array.from(contact_panel.panel_element.querySelectorAll('.panel-content .el'));
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
    portfolio_link.onclick = () => panel_context.renderPanel(locked_panel);
    blog_link.onclick = () => panel_context.renderPanel(locked_panel);
    contact_link.onclick = () => panel_context.renderPanel(contact_panel);
    
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
}
