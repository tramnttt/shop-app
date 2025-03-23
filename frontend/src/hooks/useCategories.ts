import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, CreateCategoryDto, UpdateCategoryDto } from '../services/categoryService';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll
    });
};

export const useCategory = (id: number) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => categoryService.getById(id)
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => categoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
            categoryService.update(id, data),
        onSuccess: () => {
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