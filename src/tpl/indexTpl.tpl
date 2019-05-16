{{each $data as item}}
<div class="demo-item" data-src="{{item.filePath}}" data-action="chooseDemo">
    <span>{{item.fileName}}</span>
</div>
{{/each}}

