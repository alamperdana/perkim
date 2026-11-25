import { cn } from '@/lib/utils';

type MainProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean;
    fluid?: boolean;
};

export function Main({ fixed, className, fluid = false, ...props }: MainProps) {
    return (
        <main
            data-layout={fixed ? 'fixed' : 'auto'}
            className={cn(
                'flex-1 p-4 md:p-6 lg:p-8',
                fixed && 'flex grow flex-col overflow-hidden',
                !fluid && 'mx-auto w-full max-w-7xl',
                className
            )}
            {...props}
        />
    );
}
