import { Menu } from '@base-ui/react/menu';

/**
 * A small "⋯ More" dropdown for secondary row actions.
 * items: [{ label, onClick, danger?: boolean }]
 */
export default function ActionMenu({ items, label = 'More' }) {
  return (
    <Menu.Root>
      <Menu.Trigger className="btn-outline !px-3 !py-1 text-xs">
        {label} ⋯
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end">
          <Menu.Popup className="min-w-[10rem] rounded-xl border border-canopy-100 bg-white p-1.5 shadow-leaf outline-none">
            {items.map((item, i) => (
              <Menu.Item
                key={i}
                onClick={item.onClick}
                className={`cursor-pointer select-none rounded-lg px-3 py-1.5 text-sm outline-none transition-colors data-[highlighted]:bg-canopy-50 ${
                  item.danger ? 'text-clay-600 data-[highlighted]:bg-clay-500/10' : 'text-canopy-950'
                }`}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}