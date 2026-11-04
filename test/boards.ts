/**
 * The collapsed rows as the two hosts draw them, from the live boards on
 * 2026-11-04, trimmed of focus zones and the like. Each board also has a row
 * without a work item, which the tweaks leave alone.
 */

/** dev.azure.com, New Boards Hub: a collapsed story, an expanded one and a collapsed Unparented row. */
export function cloudBoard(): string {
  return `
<table class="sticky-table bolt-table">
  <tbody>
    <tr data-row-index="0">
      <td class="taskboard-collapsed-row" colspan="5" data-column="parent-column" data-row="6" data-iscollapsed="true">
        <div class="flex-row flex-center">
          <button aria-label="Expand this row" class="taskboard-expand-collapse-button bolt-button" id="__bolt-expand-collapse-button-6"></button>
          <span aria-label="Product Backlog Item" class="fluent-icons-enabled" role="img"><span aria-hidden="true" class="work-item-type-icon margin-left-8"></span></span>
          <span class="margin-left-8">Make a test case for DevOps</span>
          <div class="taskboard-state-rollup flex-row"><span>1 not started</span><span class="margin-left-8">1 in progress (2)</span></div>
        </div>
      </td>
    </tr>
    <tr class="bolt-list-row-spacer"></tr>
    <tr data-row-index="1">
      <td class="taskboard-parent-cell">
        <div class="wit-card taskboard-card">
          <span class="font-weight-semibold selectable-text">8</span>
          <a class="title" href="/kudo/scrum-test/_workitems/edit/8">Expanded story</a>
          <div class="work-item-state-name"><span>Active</span></div>
        </div>
      </td>
    </tr>
    <tr data-row-index="2">
      <td class="taskboard-collapsed-row" colspan="5" data-column="parent-column" data-row="unparented" data-iscollapsed="true">
        <div class="flex-row flex-center">
          <button aria-label="Expand this row" class="taskboard-expand-collapse-button bolt-button"></button>
          <span class="margin-left-8">Unparented</span>
          <div class="taskboard-state-rollup flex-row"><span>2 not started</span></div>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;
}

/** Azure DevOps Server: a collapsed story with its hidden content row, and the Unparented row. */
export function serverBoard(): string {
  return `
<table id="taskboard-table-body">
  <tbody>
    <tr class="taskboard-row taskboard-content-row" id="taskboard-row-15" style="display: none;">
      <td class="taskboard-cell taskboard-parent" id="taskboard-table-body_p687">
        <div id="tile-687" class="parentTbTile"><div class="id" field="System.Id">687</div></div>
      </td>
    </tr>
    <tr class="taskboard-row taskboard-row-summary ui-droppable" id="taskboard-summary-row-15">
      <td class="taskboard-expander"><button class="bowtie-icon bowtie-toggle-tree-collapsed" title="Expand this row"></button></td>
      <td class="taskboard-cell taskboard-parent taskboard-parent-width" colspan="5">
        <div class="tbPivotItem">
          <div class="ellipsis" tabindex="0">
            <span class="collapsed-tile-gutter"></span>
            <span class="icon bowtie-icon bowtie-status-warning pivot-warning" style="display:none;"></span>
            <span class="witTitle">KYOTO tools behind prod Authentik</span>
            <div class="witStateSummary"><span class="work-item-count">1 not started</span><span class="witRemainingWork"></span></div>
          </div>
        </div>
      </td>
    </tr>
    <tr class="taskboard-row taskboard-content-row" id="taskboard-row-16" style="display: none;">
      <td class="taskboard-cell taskboard-parent" id="taskboard-table-body_unparented"></td>
    </tr>
    <tr class="taskboard-row taskboard-row-summary ui-droppable" id="taskboard-summary-row-16">
      <td class="taskboard-expander"><button class="bowtie-icon bowtie-toggle-tree-collapsed" title="Expand this row"></button></td>
      <td class="taskboard-cell taskboard-parent taskboard-parent-width" colspan="5">
        <div class="tbPivotItem">
          <div class="ellipsis" tabindex="0">
            <span class="witTitle">Unparented</span>
            <div class="witStateSummary"><span class="work-item-count">3 not started</span></div>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;
}
