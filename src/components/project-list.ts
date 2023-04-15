/// <reference path="base-components.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />

namespace App {
  export  class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: Project[];

        constructor(private type: ProjectStatus) {
            super('project-list', 'app', false, `${type === 0 ? "active" : "finished"}-projects`)

            this.assignedProjects = [];

            this.configure();
            this.renderContent();
        }

        @autobind
        dragOverHandler(event: DragEvent) {
            if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
                event.preventDefault();
                const listEl = this.element.querySelector("ul")!;
                listEl.classList.add("droppable");
            }
        }

        @autobind
        dropHandler(event: DragEvent) {
            const prjId = event.dataTransfer!.getData("text/plain");
            projectState.moveProject(prjId, this.type)
        }

        @autobind
        dragLeaveHandler(_: DragEvent) {
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.remove("droppable");
        }

        private renderProjects() {
            const listEl = document.getElementById(
                `${this.type}-projects-list`
            )! as HTMLUListElement;
            listEl.innerHTML = "";
            for (const prjItem of this.assignedProjects) {
                new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
            }
        }

        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent =
                (this.type === 0 ? "Active" : "Finished") + ' PROJECTS';
        }

        configure() {
            this.element.addEventListener("dragover", this.dragOverHandler)
            this.element.addEventListener("dragleave", this.dragLeaveHandler)
            this.element.addEventListener("drop", this.dropHandler)

            projectState.addListener((projects: Project[]) => {
                const relevantProject = projects.filter(prj => {
                    if (this.type === ProjectStatus.Active) {
                        return prj.status === ProjectStatus.Active
                    }
                    return prj.status === ProjectStatus.Finished
                })
                this.assignedProjects = relevantProject;
                this.renderProjects();
            });
        }
    }
}
