import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category, CreateCategoryDto, UpdateCategoryDto } from '../services/categoryService';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            console.log('DEBUG - Fetching categories');
            const categories = await categoryService.getAll();
            console.log('DEBUG - Got categories:', categories);
            return categories;
        },
        staleTime: 60000, // 1 minute
    });
};

export const useCategory = (id: number) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: () => categoryService.getById(id),
        enabled: !!id,
    });
};

interface CreateCategoryWithImage extends CreateCategoryDto {
    imageFile?: File;
}

interface UpdateCategoryWithImage {
    id: number;
    data: UpdateCategoryDto;
    imageFile?: File;
}

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryWithImage) => categoryService.create(data, data.imageFile),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateCategoryWithImage) =>
            categoryService.update(data.id, data.data, data.imageFile),
        onSuccess: (updatedCategory) => {
            queryClient.invalidateQueries({ queryKey: ['category', updatedCategory.id] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}; 