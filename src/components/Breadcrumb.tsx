import React from 'react';
import { Link } from '@/navigation';

interface BreadcrumbItem {
    label: string;
    href: string;
    active?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link href="/" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <li>
                            <svg
                                className="flex-shrink-0 w-5 h-5 text-muted-foreground/50"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </li>
                        <li>
                            {item.active ? (
                                <span className="text-brand-700 font-semibold text-sm">
                                    {item.label}
                                </span>
                            ) : (
                                <Link href={item.href} className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;