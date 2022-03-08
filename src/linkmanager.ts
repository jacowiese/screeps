export class LinkManager {

    public update(linkNodes: Array<LinkNode>): void {

        if (linkNodes.length > 0) {
            linkNodes.forEach((node: LinkNode) => {

                let targetLink: StructureLink | null = Game.getObjectById<StructureLink>(node.target);

                if (targetLink != null && targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {

                    if (node.source.length > 0) {

                        node.source.forEach((srcId: string) => {

                            let srcLink: StructureLink | null = Game.getObjectById<StructureLink>(srcId);
                            if (srcLink != null && srcLink.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {

                                console.log("Link: transfer from " + srcId + " to " + node.target);
                                if (srcLink.transferEnergy(targetLink as StructureLink) == ERR_FULL) {
                                    console.log("Link full: " + node.target);
                                }
                            }
                        });
                    }
                };
            });
        }
    }

}
