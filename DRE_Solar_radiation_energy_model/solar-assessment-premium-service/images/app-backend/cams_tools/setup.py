from setuptools import setup, find_packages

setup(
    name='cams-tools',
    version='0.1.0',
    description='Tools for CAMS Solar Radiation Data queries',
    author='Rizos-Theodoros Chadoulis',
    packages=find_packages(),
    install_requires=[
        'requests>=2.0',
        'pandas>=1.0',
        'numpy>=1.18',
        'xarray>=0.15',
        'pvlib>=0.9',
        'ephem>=3.7',
        'destinelab>=1.0',
        'tqdm>=4.0',
    ],
    python_requires='>=3.7',
)
