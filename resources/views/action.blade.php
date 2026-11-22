<div class="btn-group">
    <button type="button" class="btn btn-icon rounded-pill dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
        <i class="ti ti-dots-vertical"></i>
    </button>
    <ul class="dropdown-menu">
        @foreach ($actions as $key => $item)
            <li><a class="dropdown-item {{ $key == 'Delete' ? 'delete' : 'action' }}"
                    href="{{ $item }}">{{ $key }}</a></li>
        @endforeach
    </ul>
</div>
